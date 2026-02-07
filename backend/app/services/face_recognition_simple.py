"""
Multi-Model Face Recognition Service (Database-Backed).
Uses FaceNet512 + ArcFace ensemble for higher accuracy.
"""
import cv2
import numpy as np
from typing import Optional, Dict
from app.services.ml_service import ml_service
from app.models.user import User
from datetime import datetime

# ===================== CONFIG =====================
# Distance Thresholds (Lower is stricter)
THRESHOLDS = {
    "Facenet512": 0.40,  # Stricter than single model
    "ArcFace": 0.60
}
ENSEMBLE_THRESHOLD = 50.0 # Percent confidence required
LOCK_FRAMES = 40
EMOTION_INTERVAL = 15
# =================================================

def cosine_distance(a, b):
    try:
        return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    except:
        return 1.0

def distance_to_percent(dist, threshold):
    percent = (1 - dist / threshold) * 100
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
                    # Handle legacy single-model records if any (migration fallback)
                    if "embedding" in u:
                       new_db.append({
                           "user_id": str(u["_id"]),
                           "name": u.get("name", "Unknown"),
                           "rollNo": u.get("rollNo", ""),
                           "embeddings": { "Facenet512": np.array(u["embedding"]) } 
                       })
                    continue

                # Normal Multi-Model record
                stored_embeds = {}
                for model, vec in u["embeddings"].items():
                     stored_embeds[model] = np.array(vec)
                
                new_db.append({
                    "user_id": str(u["_id"]),
                    "name": u.get("name", "Unknown"),
                    "rollNo": u.get("rollNo", ""),
                    "embeddings": stored_embeds
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

        # 1. Generate Query Embeddings (Multi-Model)
        # ml_service detects face and returns dict { "Facenet512": vec, "ArcFace": vec }
        query_embeddings = ml_service.generate_embedding(frame)
        
        if not query_embeddings:
            return None

        # 2. Match against Database
        best_match = None
        best_avg_conf = 0.0

        for user_rec in self.database:
            user_confs = []
            
            # Compare each available model
            for model_name, query_vec in query_embeddings.items():
                if model_name in user_rec["embeddings"]:
                    db_vec = user_rec["embeddings"][model_name]
                    dist = cosine_distance(query_vec, db_vec)
                    
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
            "bbox": { "x":0, "y":0, "w":0, "h":0 } # BBox logic simplified as ml_service handles it internally now
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
