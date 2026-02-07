from flask import Blueprint
# Session CRUD is under faculty (POST/GET /api/faculty/sessions). This blueprint can expose shared read if needed.
bp = Blueprint("sessions", __name__)


@bp.route("/active", methods=["GET"])
def active():
    """Optional: list active sessions (e.g. for student mobile mode to pick session)."""
    from flask import request, jsonify
    from app.extensions import get_mongo
    from app.models.session import Session
    db = get_mongo()
    # Return sessions that are not ended (endTime is None)
    sessions = list(Session.collection(db).find({"endTime": None}).sort("startTime", -1).limit(20))
    return jsonify({"sessions": [Session.to_json(s) for s in sessions]})
