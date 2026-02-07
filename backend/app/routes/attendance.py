from flask import Blueprint, request, jsonify
from app.extensions import get_mongo, require_auth
from app.models.attendance import Attendance
from app.models.session import Session

bp = Blueprint("attendance", __name__)


@bp.route("", methods=["GET"])
@require_auth(roles=["admin", "faculty", "student"])
def list_attendance():
    db = get_mongo()
    user = request.current_user
    role = user.get("role")
    date_from = request.args.get("dateFrom")
    date_to = request.args.get("dateTo")
    class_name = request.args.get("class")
    subject = request.args.get("subject")

    query = {}
    if role == "student":
        query["studentId"] = user["sub"]
    # admin and faculty see all attendances (no studentId filter)
    if date_from:
        query["date"] = query.get("date") or {}
        query["date"]["$gte"] = date_from
    if date_to:
        query["date"] = query.get("date") or {}
        query["date"]["$lte"] = date_to
    if class_name:
        query["class"] = class_name
    if subject:
        query["subject"] = subject

    attendances = list(Attendance.collection(db).find(query).sort("date", -1).sort("time", -1).limit(200))
    return jsonify({"attendances": [Attendance.to_json(a) for a in attendances]})


@bp.route("/mark", methods=["POST"])
@require_auth(roles=["faculty", "student"])
def mark():
    """Called after face verify (and optional GPS check). Expects sessionId, studentId, studentName, subject, class, mode."""
    from app.services.attendance_service import mark_attendance as do_mark

    data = request.get_json() or {}
    session_id = data.get("sessionId")
    student_id = data.get("studentId")
    student_name = data.get("studentName")
    subject = data.get("subject")
    class_name = data.get("class")
    mode = data.get("mode") or "webcam"

    if not all([session_id, student_id, student_name, subject, class_name]):
        return jsonify({"error": "sessionId, studentId, studentName, subject, class required"}), 400

    db = get_mongo()
    success, msg = do_mark(db, session_id, student_id, student_name, subject, class_name, mode)
    if not success:
        return jsonify({"error": msg, "alreadyMarked": msg == "Already marked"}), 400
    return jsonify({"message": msg})
