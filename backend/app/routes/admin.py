from flask import Blueprint, request, jsonify
import bcrypt
from bson import ObjectId
from app.extensions import get_mongo, require_auth
from app.models.user import User
from app.models.attendance import Attendance
from datetime import datetime, timedelta

bp = Blueprint("admin", __name__)


def _settings_collection(db):
    return db.settings


@bp.route("/faculty", methods=["GET"])
@require_auth(roles=["admin"])
def list_faculty():
    db = get_mongo()
    faculty = list(User.collection(db).find({"role": User.ROLE_FACULTY}).sort("name", 1))
    return jsonify({"faculty": [User.to_json(u) for u in faculty]})


@bp.route("/faculty", methods=["POST"])
@require_auth(roles=["admin"])
def create_faculty():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password required"}), 400

    db = get_mongo()
    if User.collection(db).find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    doc = {
        "role": User.ROLE_FACULTY,
        "name": name,
        "email": email,
        "password": hashed,
        "faceRegistered": False,
        "createdAt": datetime.utcnow(),
    }
    r = User.collection(db).insert_one(doc)
    doc["_id"] = r.inserted_id
    return jsonify({"faculty": User.to_json(doc)}), 201


@bp.route("/faculty/<faculty_id>", methods=["PUT"])
@require_auth(roles=["admin"])
def update_faculty(faculty_id):
    data = request.get_json() or {}
    db = get_mongo()
    try:
        oid = ObjectId(faculty_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    user = User.collection(db).find_one({"_id": oid, "role": User.ROLE_FACULTY})
    if not user:
        return jsonify({"error": "Faculty not found"}), 404

    updates = {}
    if "name" in data and data["name"]:
        updates["name"] = data["name"].strip()
    if "email" in data and data["email"]:
        email = data["email"].strip()
        if User.collection(db).find_one({"email": email, "_id": {"$ne": oid}}):
            return jsonify({"error": "Email already exists"}), 400
        updates["email"] = email
    if data.get("password"):
        updates["password"] = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    if updates:
        User.collection(db).update_one({"_id": oid}, {"$set": updates})
    updated = User.collection(db).find_one({"_id": oid})
    return jsonify({"faculty": User.to_json(updated)})


@bp.route("/faculty/<faculty_id>", methods=["DELETE"])
@require_auth(roles=["admin"])
def delete_faculty(faculty_id):
    db = get_mongo()
    try:
        oid = ObjectId(faculty_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400
    result = User.collection(db).delete_one({"_id": oid, "role": User.ROLE_FACULTY})
    if result.deleted_count == 0:
        return jsonify({"error": "Faculty not found"}), 404
    return jsonify({"message": "Deleted"})


@bp.route("/students", methods=["GET"])
@require_auth(roles=["admin"])
def list_students():
    db = get_mongo()
    students = list(User.collection(db).find({"role": User.ROLE_STUDENT}).sort("name", 1))
    return jsonify({"students": [User.to_json(u) for u in students]})


@bp.route("/students", methods=["POST"])
@require_auth(roles=["admin"])
def create_student():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or "student123"
    class_name = (data.get("class") or data.get("className") or "").strip()

    if not name or not email:
        return jsonify({"error": "Name and email required"}), 400

    db = get_mongo()
    if User.collection(db).find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    doc = {
        "role": User.ROLE_STUDENT,
        "name": name,
        "email": email,
        "password": hashed,
        "class": class_name or None,
        "faceRegistered": False,
        "createdAt": datetime.utcnow(),
    }
    r = User.collection(db).insert_one(doc)
    doc["_id"] = r.inserted_id
    return jsonify({"student": User.to_json(doc)}), 201


@bp.route("/students/<student_id>", methods=["PUT"])
@require_auth(roles=["admin"])
def update_student(student_id):
    data = request.get_json() or {}
    db = get_mongo()
    try:
        oid = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    user = User.collection(db).find_one({"_id": oid, "role": User.ROLE_STUDENT})
    if not user:
        return jsonify({"error": "Student not found"}), 404

    updates = {}
    if "name" in data:
        updates["name"] = (data["name"] or "").strip()
    if "email" in data:
        email = (data["email"] or "").strip()
        if User.collection(db).find_one({"email": email, "_id": {"$ne": oid}}):
            return jsonify({"error": "Email already exists"}), 400
        updates["email"] = email
    if "class" in data:
        updates["class"] = (data["class"] or "").strip() or None
    if data.get("password"):
        updates["password"] = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    if updates:
        User.collection(db).update_one({"_id": oid}, {"$set": updates})
    updated = User.collection(db).find_one({"_id": oid})
    return jsonify({"student": User.to_json(updated)})


@bp.route("/students/<student_id>", methods=["DELETE"])
@require_auth(roles=["admin"])
def delete_student(student_id):
    db = get_mongo()
    try:
        oid = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400
    result = User.collection(db).delete_one({"_id": oid, "role": User.ROLE_STUDENT})
    if result.deleted_count == 0:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"message": "Deleted"})


@bp.route("/settings", methods=["GET"])
@require_auth(roles=["admin", "faculty"])
def get_settings():
    db = get_mongo()
    doc = _settings_collection(db).find_one({"key": "global"})
    mobile_gps = doc.get("mobileGpsEnabled", False) if doc else False
    return jsonify({"mobileGpsEnabled": mobile_gps})


@bp.route("/settings", methods=["PATCH"])
@require_auth(roles=["admin"])
def update_settings():
    data = request.get_json() or {}
    db = get_mongo()
    mobile_gps = data.get("mobileGpsEnabled")
    if mobile_gps is None:
        return jsonify({"error": "mobileGpsEnabled required"}), 400
    _settings_collection(db).update_one(
        {"key": "global"},
        {"$set": {"key": "global", "mobileGpsEnabled": bool(mobile_gps)}},
        upsert=True,
    )
    return jsonify({"mobileGpsEnabled": bool(mobile_gps)})


@bp.route("/reports", methods=["GET"])
@require_auth(roles=["admin"])
def reports():
    db = get_mongo()
    today = datetime.utcnow().date().isoformat()
    total_faculty = User.collection(db).count_documents({"role": User.ROLE_FACULTY})
    total_students = User.collection(db).count_documents({"role": User.ROLE_STUDENT})
    today_attendance = Attendance.collection(db).count_documents({"date": today})
    doc = _settings_collection(db).find_one({"key": "global"})
    mobile_gps = doc.get("mobileGpsEnabled", False) if doc else False
    return jsonify({
        "totalFaculty": total_faculty,
        "totalStudents": total_students,
        "todayAttendance": today_attendance,
        "mobileGpsEnabled": mobile_gps,
    })
