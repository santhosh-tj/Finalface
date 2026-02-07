from flask import Blueprint, request, jsonify
from bson import ObjectId
import uuid
from datetime import datetime
from app.extensions import get_mongo, require_auth
from app.models.user import User
from app.models.session import Session
from app.models.attendance import Attendance

bp = Blueprint("faculty", __name__)


@bp.route("/sessions", methods=["GET"])
@require_auth(roles=["faculty"])
def list_sessions():
    db = get_mongo()
    faculty_id = request.current_user["sub"]
    sessions = list(Session.collection(db).find({"facultyId": faculty_id}).sort("startTime", -1).limit(50))
    return jsonify({"sessions": [Session.to_json(s) for s in sessions]})


@bp.route("/sessions", methods=["POST"])
@require_auth(roles=["faculty"])
def create_session():
    data = request.get_json() or {}
    class_name = (data.get("class") or data.get("className") or "").strip()
    subject = (data.get("subject") or "").strip()
    mode = (data.get("mode") or "webcam").strip().lower()
    gps_location = data.get("gpsLocation")  # { lat, lng }
    gps_radius = data.get("gpsRadius")  # meters

    if not class_name or not subject:
        return jsonify({"error": "Class and subject required"}), 400
    if mode not in (Session.MODE_WEBCAM, Session.MODE_MOBILE):
        mode = Session.MODE_WEBCAM

    db = get_mongo()
    # Check if mobile mode is enabled (admin setting)
    settings = db.settings.find_one({"key": "global"})
    if mode == Session.MODE_MOBILE and not (settings and settings.get("mobileGpsEnabled")):
        return jsonify({"error": "Mobile + GPS mode is disabled by admin"}), 400

    session_id = str(uuid.uuid4())
    faculty_id = request.current_user["sub"]
    doc = {
        "sessionId": session_id,
        "facultyId": faculty_id,
        "class": class_name,
        "subject": subject,
        "mode": mode,
        "startTime": datetime.utcnow(),
        "endTime": None,
        "gpsLocation": gps_location if mode == Session.MODE_MOBILE else None,
        "gpsRadius": gps_radius if mode == Session.MODE_MOBILE else None,
    }
    Session.collection(db).insert_one(doc)
    return jsonify({"session": Session.to_json(doc)}), 201


@bp.route("/sessions/<session_id>", methods=["GET"])
@require_auth(roles=["faculty"])
def get_session(session_id):
    db = get_mongo()
    faculty_id = request.current_user["sub"]
    session = Session.collection(db).find_one({"sessionId": session_id, "facultyId": faculty_id})
    if not session:
        return jsonify({"error": "Session not found"}), 404
    count = Attendance.collection(db).count_documents({"sessionId": session_id})
    class_name = session.get("class")
    total_students = User.collection(db).count_documents({"role": User.ROLE_STUDENT, "class": class_name}) if class_name else 0
    out = Session.to_json(session)
    out["presentCount"] = count
    out["totalStudents"] = total_students
    return jsonify({"session": out})


@bp.route("/sessions/<session_id>/end", methods=["POST"])
@require_auth(roles=["faculty"])
def end_session(session_id):
    db = get_mongo()
    faculty_id = request.current_user["sub"]
    result = Session.collection(db).update_one(
        {"sessionId": session_id, "facultyId": faculty_id, "endTime": None},
        {"$set": {"endTime": datetime.utcnow()}},
    )
    if result.modified_count == 0:
        return jsonify({"error": "Session not found or already ended"}), 404
    return jsonify({"message": "Session ended"})


@bp.route("/sessions/<session_id>/attendance", methods=["GET"])
@require_auth(roles=["faculty"])
def session_attendance(session_id):
    db = get_mongo()
    faculty_id = request.current_user["sub"]
    session = Session.collection(db).find_one({"sessionId": session_id, "facultyId": faculty_id})
    if not session:
        return jsonify({"error": "Session not found"}), 404
    attendances = list(Attendance.collection(db).find({"sessionId": session_id}))
    return jsonify({
        "session": Session.to_json(session),
        "attendances": [Attendance.to_json(a) for a in attendances],
    })
