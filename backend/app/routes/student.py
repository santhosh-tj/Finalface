from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime, timedelta
from app.extensions import get_mongo, require_auth
from app.models.user import User
from app.models.attendance import Attendance
from app.services.face_service import FaceService
from app.services.supabase_storage import upload_face_image

bp = Blueprint("student", __name__)


@bp.route("/me", methods=["GET"])
@require_auth(roles=["student"])
def me():
    db = get_mongo()
    user_id = request.current_user["sub"]
    user = User.collection(db).find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Attendance stats: total sessions attended vs total (by subject/class if needed)
    pipeline = [
        {"$match": {"studentId": user_id}},
        {"$group": {"_id": {"subject": "$subject", "class": "$class"}, "count": {"$sum": 1}}},
    ]
    by_subject = list(Attendance.collection(db).aggregate(pipeline))
    total_attended = Attendance.collection(db).count_documents({"studentId": user_id})

    out = User.to_json(user)
    out["attendanceStats"] = {"totalAttended": total_attended, "bySubject": by_subject}
    return jsonify({"user": out})


@bp.route("/register-face", methods=["POST"])
@require_auth(roles=["faculty"])
def register_student_face():
    """Faculty registers a student's face (only if student has not registered)."""
    data = request.get_json() or {}
    if not data and request.form:
        data = dict(request.form)
    student_id = (data.get("studentId") or request.form.get("studentId") or "").strip()
    if isinstance(student_id, list):
        student_id = (student_id[0] or "").strip()
    if not student_id:
        return jsonify({"error": "studentId required"}), 400

    if "image" not in request.files and not data.get("image") and not data.get("base64"):
        return jsonify({"error": "Image required"}), 400

    db = get_mongo()
    try:
        oid = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID"}), 400

    student = User.collection(db).find_one({"_id": oid, "role": User.ROLE_STUDENT})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    if student.get("faceRegistered"):
        return jsonify({"error": "Face already registered for this student"}), 403

    if request.files.get("image"):
        image_bytes = request.files["image"].read()
    else:
        import base64
        b64 = data.get("image") or data.get("base64")
        image_bytes = base64.b64decode(b64)

    face_service = FaceService(db)
    result = face_service.register_face(
        image_bytes=image_bytes,
        user_id=student_id,
        user_role=User.ROLE_STUDENT,
        exclude_user_id=student_id,
    )
    if not result.get("success"):
        return jsonify({"error": result.get("error", "Registration failed")}), 400

    url = upload_face_image(image_bytes, f"{student_id}_{student.get('email', '').replace('@', '_')}.jpg")
    update = {"faceEncoding": result["encoding"], "faceRegistered": True}
    if url:
        update["supabaseImageUrl"] = url
    User.collection(db).update_one({"_id": oid}, {"$set": update})
    updated = User.collection(db).find_one({"_id": oid})
    return jsonify({"message": "Face registered", "student": User.to_json(updated)})
