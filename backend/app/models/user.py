from datetime import datetime
from bson import ObjectId


class User:
    ROLE_ADMIN = "admin"
    ROLE_FACULTY = "faculty"
    ROLE_STUDENT = "student"

    @staticmethod
    def collection(db):
        return db.users

    @staticmethod
    def ensure_indexes(db):
        User.collection(db).create_index("email", unique=True)

    @staticmethod
    def to_json(doc):
        if not doc:
            return None
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        doc.pop("password", None)
        doc.pop("faceEncoding", None)  # never expose encoding to client
        return doc
