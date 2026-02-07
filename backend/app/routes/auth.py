from flask import Blueprint, request, jsonify
import bcrypt
from bson import ObjectId
from app.extensions import get_mongo, create_jwt_token, require_auth
from app.models.user import User

bp = Blueprint("auth", __name__)


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    db = get_mongo()
    user = User.collection(db).find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    try:
        # Ensure stored password is in bytes for bcrypt
        stored_pw = user["password"]
        if isinstance(stored_pw, str):
             stored_pw = stored_pw.encode('utf-8')
        
        if not bcrypt.checkpw(password.encode("utf-8"), stored_pw):
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Authentication error"}), 500

    token = create_jwt_token(
        str(user["_id"]),
        user["email"],
        user["role"],
    )
    return jsonify({
        "token": token,
        "user": User.to_json(user),
    })


@bp.route("/register-face", methods=["POST"])
@require_auth(roles=["student", "faculty"])
def register_own_face():
    """Student/Faculty registers their own face. One face per user."""
    from app.services.face_service import FaceService
    from app.services.supabase_storage import upload_face_image

    if "image" not in request.files and not request.get_json():
        return jsonify({"error": "Image required"}), 400

    db = get_mongo()
    user_id = request.current_user["sub"]
    user = User.collection(db).find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.get("faceRegistered"):
        return jsonify({"error": "Face already registered"}), 403

    if request.files.get("image"):
        file = request.files["image"]
        image_bytes = file.read()
    else:
        import base64
        data = request.get_json()
        b64 = data.get("image") or data.get("base64")
        if not b64:
            return jsonify({"error": "Image required (file or base64)"}), 400
        
        # Handle data URLs by stripping the prefix
        if b64.startswith("data:image/"):
            b64 = b64.split(",", 1)[1]
        
        image_bytes = base64.b64decode(b64)

    face_service = FaceService(db)
    result = face_service.register_face(
        image_bytes=image_bytes,
        user_id=user_id,
        user_role=user["role"],
        exclude_user_id=user_id,
    )
    if not result.get("success"):
        return jsonify({"error": result.get("error", "Registration failed")}), 400

    # Upload to Supabase and save URL
    url = upload_face_image(image_bytes, f"{user_id}_{user['email'].replace('@', '_')}.jpg")
    if url:
        User.collection(db).update_one(
            {"_id": user["_id"]},
            {"$set": {"faceEncoding": result["encoding"], "faceRegistered": True, "supabaseImageUrl": url}}
        )
    else:
        User.collection(db).update_one(
            {"_id": user["_id"]},
            {"$set": {"faceEncoding": result["encoding"], "faceRegistered": True}}
        )

    return jsonify({"message": "Face registered successfully", "user": User.to_json(User.collection(db).find_one({"_id": user["_id"]}))})
