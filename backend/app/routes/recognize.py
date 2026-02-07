"""Live face recognition endpoint using lightweight OpenCV approach."""
from flask import Blueprint, request, jsonify
from app.extensions import get_mongo
from app.models.user import User
from app.services.face_recognition_simple import get_recognizer
from app.services.attendance_service import mark_attendance
from app.models.session import Session
from bson import ObjectId
import base64

bp = Blueprint("recognize", __name__)


@bp.route("/api/face/recognize", methods=["POST"])
def recognize_face():
    """
    Real-time face recognition for attendance marking.
    Uses lightweight OpenCV LBPHFaceRecognizer.
    """
    try:
        data = request.get_json() or {}
        
        # Get session ID (for attendance session)
        session_id = data.get("sessionId")
        if not session_id:
            return jsonify({"error": "Session ID required"}), 400
        
        # Get image (base64 encoded)
        image_b64 = data.get("image")
        if not image_b64:
            return jsonify({"error": "Image required"}), 400
        
        # Decode base64 image
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]
        image_bytes = base64.b64decode(image_b64)
        
        # Get recognizer and recognize face
        recognizer = get_recognizer()
        result = recognizer.recognize_face(image_bytes)
        
        if result is None:
            # No face detected or recognized
            return jsonify({
                "success": True,
                "faces": []
            })
        
        # Get user details from database
        db = get_mongo()
        user = User.collection(db).find_one({"_id": ObjectId(result["user_id"])})
        
        if not user:
            return jsonify({
                "success": True,
                "faces": []
            })
        
        # Build response
        face_data = {
            "student_id": result["user_id"],
            "name": user.get("name", "Unknown"),
            "rollNo": user.get("rollNo", ""),
            "confidence": result["confidence"],
            "bbox": {
                "x": result["bbox"][0],
                "y": result["bbox"][1],
                "w": result["bbox"][2],
                "h": result["bbox"][3]
            }
        }
        
        # Auto-mark attendance if confidence >= 50%
        if result["confidence"] >= 50:
            # Check if attendance session exists
            db = get_mongo()
            session_obj = Session.collection(db).find_one({"_id": ObjectId(session_id)})
            
            if session_obj:
                # Mark attendance
                marked = mark_attendance(
                    session_id=session_id,
                    student_id=result["user_id"],
                    db=db
                )
                face_data["attendance_marked"] = marked
        
        return jsonify({
            "success": True,
            "faces": [face_data]
        })
        
    except Exception as e:
        import traceback
        print(f"[ERROR] Recognition error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@bp.route("/api/face/retrain", methods=["POST"])
def retrain_recognizer():
    """Manually trigger recognizer retraining (admin only)."""
    try:
        recognizer = get_recognizer()
        success = recognizer.train_from_datasets()
        
        if success:
            return jsonify({
                "success": True,
                "message": "Recognizer retrained successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "No training data found"
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
