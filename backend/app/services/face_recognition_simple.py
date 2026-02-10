"""Face recognition service backed by OpenCV + Facenet512 embeddings."""
import cv2
import numpy as np
from typing import Optional, Dict
from app.services.ml_service import ml_service
from app.models.user import User
from datetime import datetime

# ===================== CONFIG =====================
THRESHOLDS = {
    # Webcam frames vary a lot from registration frames; 0.40 is too strict in practice.
    "Facenet512": 0.75
}
ENSEMBLE_THRESHOLD = 35.0
LOCK_FRAMES = 40
EMOTION_INTERVAL = 15
# =================================================

def cosine_distance(a, b):
    try:
        a = np.array(a, dtype=np.float32)
        b = np.array(b, dtype=np.float32)
        denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9
        cos = float(np.dot(a, b) / denom)
        cos = max(-1.0, min(1.0, cos))
        return 1.0 - cos
    except:
        return 1.0

def distance_to_percent(dist, threshold):
    percent = (1.0 - (dist / max(threshold, 1e-9))) * 100.0
    return max(0.0, min(100.0, percent))

class MultiModelRecognizer:
    def __init__(self):
        self.database = []
        self.last_load_time = None
        self.load_interval = 300 # Refresh DB every 5 minutes
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        # Runtime state
        self.frame_idx = 0
        self.last_emotion = "neutral"

    def invalidate_cache(self):
        """Force next recognition request to reload user embeddings."""
        self.last_load_time = None

    def refresh_database(self, db):
        """Fetch all registered users from MongoDB."""
        now = datetime.utcnow()
        if self.last_load_time and (now - self.last_load_time).total_seconds() < self.load_interval:
            return

        try:
            print("[ANTIGRAVITY] [SYNC] Refreshing face database from MongoDB...")
            users = list(User.collection(db).find({"faceRegistered": True}))
            
            new_db = []
            for u in users:
                if "embeddings" not in u:
                    if "embedding" in u:
                        base_emb = np.array(u["embedding"], dtype=np.float32)
                        proto_list = [base_emb]
                        if isinstance(u.get("embeddingPrototypes"), list) and u["embeddingPrototypes"]:
                            proto_list = [np.array(p, dtype=np.float32) for p in u["embeddingPrototypes"]]
                        new_db.append({
                            "user_id": str(u["_id"]),
                            "name": u.get("name", "Unknown"),
                            "rollNo": u.get("rollNo", ""),
                            "embeddings": {"Facenet512": base_emb},
                            "prototypes": {"Facenet512": proto_list},
                        })
                    continue

                # Normal Multi-Model record
                stored_embeds = {}
                stored_prototypes = {}
                for model, vec in u["embeddings"].items():
                    if model == "Facenet512":
                        stored_embeds[model] = np.array(vec, dtype=np.float32)
                        proto_list = [stored_embeds[model]]
                        if isinstance(u.get("embeddingPrototypes"), list) and u["embeddingPrototypes"]:
                            proto_list = [np.array(p, dtype=np.float32) for p in u["embeddingPrototypes"]]
                        stored_prototypes[model] = proto_list

                new_db.append({
                    "user_id": str(u["_id"]),
                    "name": u.get("name", "Unknown"),
                    "rollNo": u.get("rollNo", ""),
                    "embeddings": stored_embeds,
                    "prototypes": stored_prototypes,
                })
            
            self.database = new_db
            self.last_load_time = now
            print(f"[ANTIGRAVITY] [OK] Loaded {len(self.database)} users from DB.")
            
        except Exception as e:
             print(f"[ERROR] DB Refresh failed: {e}")

    def recognize_face(self, image_bytes: bytes, db) -> Optional[Dict]:
        # Ensure DB is fresh
        self.refresh_database(db)

        # Decode Image
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None: return None

        query_result = ml_service.generate_embedding(frame)
        if not query_result:
            return None
        query_embeddings = query_result.get("embeddings", {})
        bbox = query_result.get("bbox", {"x": 0, "y": 0, "w": 0, "h": 0})

        # 2. Match against Database
        best_match = None
        best_avg_conf = 0.0

        for user_rec in self.database:
            user_confs = []
            
            # Compare each available model (Facenet512 only in this pipeline)
            for model_name, query_vec in query_embeddings.items():
                if model_name in user_rec["embeddings"]:
                    prototype_vecs = (
                        user_rec.get("prototypes", {}).get(model_name)
                        or [user_rec["embeddings"][model_name]]
                    )
                    dist = min(cosine_distance(query_vec, proto) for proto in prototype_vecs)
                    
                    # Convert to % based on model-specific threshold
                    thresh = THRESHOLDS.get(model_name, 0.5)
                    conf = distance_to_percent(dist, thresh)
                    user_confs.append(conf)
            
            if not user_confs: continue

            # Ensemble Score: Average confidence across models
            avg_conf = sum(user_confs) / len(user_confs)
            
            if avg_conf > best_avg_conf:
                best_avg_conf = avg_conf
                best_match = user_rec

        # 3. Decision Logic
        output = {
            "matched": False,
            "user_id": None,
            "name": "Unknown",
            "rollNo": "",
            "confidence": round(best_avg_conf, 1),
            "bbox": bbox
        }

        if best_match and best_avg_conf >= ENSEMBLE_THRESHOLD:
            output.update({
                "matched": True,
                "user_id": best_match["user_id"],
                "name": best_match["name"],
                "rollNo": best_match["rollNo"]
            })

        return output

# Singleton
_recognizer = None

def get_recognizer():
    global _recognizer
    if _recognizer is None:
        _recognizer = MultiModelRecognizer()
    return _recognizer
