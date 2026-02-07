from bson import ObjectId


class Session:
    MODE_WEBCAM = "webcam"
    MODE_MOBILE = "mobile"

    @staticmethod
    def collection(db):
        return db.sessions

    @staticmethod
    def to_json(doc):
        if not doc:
            return None
        doc["id"] = doc.get("sessionId") or str(doc.get("_id"))
        if "_id" in doc:
            doc.pop("_id")
        return doc
