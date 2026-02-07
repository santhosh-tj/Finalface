from bson import ObjectId


class Attendance:
    @staticmethod
    def collection(db):
        return db.attendances

    @staticmethod
    def to_json(doc):
        if not doc:
            return None
        doc["id"] = str(doc.get("_id", ""))
        doc.pop("_id", None)
        return doc
