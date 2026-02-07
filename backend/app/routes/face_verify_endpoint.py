@bp.route("/verify", methods=["POST"])
@require_auth(roles=["faculty", "student"])
def verify_face():
    """
    Verify face for attendance using FaceNet512 recognition.
    Called by LiveAttendancePage.
    """
    try:
        data = request.get_json() or {}
        
        # Get parameters
        session_id = data.get("sessionId")
        image_b64 = data.get("image")
        auto_mark = data.get("autoMark", True)
        
        if not session_id or not image_b64:
            return jsonify({"error": "Session ID and image required"}), 400
        
        # Decode base64 image
        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]
        
        import base64
        image_bytes = base64.b64decode(image_b64)
        
        # Get recognizer and recognize face
        from app.services.face_recognition_simple import get_recognizer
        recognizer = get_recognizer()
        
        db = get_mongo()
        result = recognizer.recognize_face(image_bytes, db)
        
        if result is None:
            # No face detected or not recognized
            return jsonify({
                "matched": False,
                "user": None,
                "attendanceMarked": False,
                "alreadyMarked": False
            })
        
        # Face recognized!
        user_data = {
            "id": result["user_id"],
            "name": result["name"],
            "rollNo": result.get("rollNo", ""),
            "confidence": result["confidence"]
        }
        
        # Check if attendance already marked
        from app.models.session import Session
        from app.models.attendance import Attendance
        from bson import ObjectId
        
        session_obj = Session.collection(db).find_one({"_id": ObjectId(session_id)})
        if not session_obj:
            return jsonify({"error": "Session not found"}), 404
        
        # Check if already marked
        existing = Attendance.collection(db).find_one({
            "sessionId": ObjectId(session_id),
            "studentId": ObjectId(result["user_id"])
        })
        
        already_marked = existing is not None
        attendance_marked = False
        
        # Auto-mark attendance if requested and not already marked
        if auto_mark and not already_marked and result["confidence"] >= 50:
            try:
                # Mark attendance
                Attendance.collection(db).insert_one({
                    "sessionId": ObjectId(session_id),
                    "studentId": ObjectId(result["user_id"]),
                    "timestamp": datetime.utcnow(),
                    "status": "present",
                    "confidence": result["confidence"]
                })
                
                # Update session present count
                Session.collection(db).update_one(
                    {"_id": ObjectId(session_id)},
                    {"$inc": {"presentCount": 1}}
                )
                
                attendance_marked = True
                print(f"[INFO] ✓ Marked attendance for {result['name']} (confidence: {result['confidence']}%)")
                
            except Exception as e:
                print(f"[WARN] Failed to mark attendance: {str(e)}")
        
        return jsonify({
            "matched": True,
            "user": user_data,
            "confidence": result["confidence"],
            "attendanceMarked": attendance_marked,
            "alreadyMarked": already_marked,
            "bbox": result["bbox"]
        })
        
    except Exception as e:
        import traceback
        print(f"[ERROR] Verify error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
