from datetime import datetime
from app.models.attendance import Attendance
from app.models.session import Session


def mark_attendance(db, session_id: str, student_id: str, student_name: str, subject: str, class_name: str, mode: str) -> tuple[bool, str]:
    """Mark attendance once per session. Returns (success, message)."""
    existing = Attendance.collection(db).find_one({"sessionId": session_id, "studentId": student_id})
    if existing:
        return False, "Already marked"

    session = Session.collection(db).find_one({"sessionId": session_id})
    if not session:
        return False, "Session not found"
    if session.get("endTime"):
        return False, "Session ended"

    now = datetime.utcnow()
    Attendance.collection(db).insert_one({
        "sessionId": session_id,
        "studentId": student_id,
        "studentName": student_name,
        "subject": subject,
        "class": class_name,
        "date": now.date().isoformat(),
        "time": now.strftime("%H:%M:%S"),
        "mode": mode,
    })
    return True, "Marked present"
