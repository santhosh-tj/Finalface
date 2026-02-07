"""Enhanced Face Service with FaceNet512 for registration and real-time recognition."""
import io
import os
import cv2
import base64
import numpy as np
from pathlib import Path
from deepface import DeepFace
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from app.config import Config
from app.models.user import User

# ===================== CONFIG =====================
MODEL_NAME = "Facenet512"
FACE_SIZE = (224, 224)
MAX_DIST = 0.55                 # Facenet512 cosine distance upper bound
MATCH_ACCEPT_PERCENT = 50.0     # ≥ 50% = accept identity
LOCK_FRAMES = 40                # keep identity for N frames
EMOTION_INTERVAL = 15           # analyze emotion every N frames
NUM_TRAINING_IMAGES = 50        # Number of images to capture for registration
# =================================================


class FaceService:
    def __init__(self, db):
        self.db = db
        self.threshold = getattr(Config, "FACE_SIMILARITY_THRESHOLD", 0.6)
        self.duplicate_threshold = getattr(Config, "FACE_DUPLICATE_THRESHOLD", 0.7)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.model = None
        self.face_database = []
        self.tracked_faces = {}
        self.next_face_id = 0
        self.frame_idx = 0

    def _load_model(self):
        """Lazy load the FaceNet512 model."""
        if self.model is None:
            print(f"[INFO] Loading {MODEL_NAME} model...")
            self.model = DeepFace.build_model(MODEL_NAME)
        return self.model

    def _cosine_distance(self, a, b):
        """Calculate cosine distance between two embeddings."""
        a, b = np.array(a, dtype=float), np.array(b, dtype=float)
        return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)

    def _cosine_similarity(self, a, b):
        """Calculate cosine similarity between two embeddings."""
        a, b = np.array(a, dtype=float), np.array(b, dtype=float)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))

    def _distance_to_percent(self, distance):
        """Convert distance to percentage match."""
        percent = (1 - distance / MAX_DIST) * 100
        return max(0.0, min(100.0, percent))

    def _get_embedding(self, image_input, model_name: str = None):
        """Get face embedding from image bytes or numpy array."""
        try:
            if model_name is None:
                model_name = MODEL_NAME

            # Convert bytes to image if needed
            if isinstance(image_input, bytes):
                nparr = np.frombuffer(image_input, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is None:
                    return None
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            else:
                # Assume it's already a numpy array
                if len(image_input.shape) == 3 and image_input.shape[2] == 3:
                    img_rgb = cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB)
                else:
                    img_rgb = image_input

            # Get face embedding
            objs = DeepFace.represent(
                img_path=img_rgb,
                model_name=model_name,
                enforce_detection=False
            )

            if not objs:
                return None

            if isinstance(objs, list):
                return np.array(objs[0]["embedding"])
            return np.array(objs["embedding"])

        except Exception as e:
            print(f"Error getting embedding: {str(e)}")
            return None

    def detect_face(self, image_bytes: bytes) -> Optional[Tuple[np.ndarray, Tuple[int, int, int, int]]]:
        """Detect face in image and return face image and bounding box."""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return None

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

            if len(faces) == 0:
                return None

            # Get the largest face
            (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])

            # Extract and resize face
            face_img = img[y:y+h, x:x+w]
            face_img = cv2.resize(face_img, FACE_SIZE)

            return face_img, (x, y, w, h)

        except Exception as e:
            print(f"Error detecting face: {str(e)}")
            return None

    def process_face_image(self, img, target_size=FACE_SIZE):
        """Detect and align face in the image."""
        try:
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

            if len(faces) == 0:
                return None

            # Get the largest face
            x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])

            # Extract face region with some padding
            padding = int(max(w, h) * 0.2)
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(img.shape[1], x + w + padding)
            y2 = min(img.shape[0], y + h + padding)

            face_img = img[y1:y2, x1:x2]

            # Resize to target size
            face_img = cv2.resize(face_img, target_size)

            return face_img

        except Exception as e:
            print(f"Error processing face: {str(e)}")
            return None

    def extract_face_embedding(self, face_img, model_name=MODEL_NAME):
        """Extract face embedding from a cropped face image."""
        try:
            # Convert to RGB if needed
            if len(face_img.shape) == 3 and face_img.shape[2] == 3:
                face_img_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
            else:
                face_img_rgb = face_img

            # Get embedding
            embedding_obj = DeepFace.represent(
                img_path=face_img_rgb,
                model_name=model_name,
                enforce_detection=False
            )

            if isinstance(embedding_obj, list):
                embedding = embedding_obj[0]['embedding']
            else:
                embedding = embedding_obj['embedding']

            return np.array(embedding)

        except Exception as e:
            print(f"Error extracting embedding: {str(e)}")
            return None

    def compare_faces(self, embedding1, embedding2):
        """Compare two face embeddings using cosine similarity."""
        try:
            emb1 = np.array(embedding1)
            emb2 = np.array(embedding2)

            # Normalize embeddings
            emb1 = emb1 / np.linalg.norm(emb1)
            emb2 = emb2 / np.linalg.norm(emb2)

            # Calculate cosine similarity
            similarity = np.dot(emb1, emb2)

            # Convert to similarity score (0-1)
            score = (similarity + 1) / 2

            return float(score)

        except Exception as e:
            print(f"Error comparing faces: {str(e)}")
            return 0.0

    def build_face_database(self):
        """Build in-memory face database from all registered students."""
        from app.services.supabase_storage import get_face_embeddings
        
        print("[INFO] Building face database...")
        self.face_database = []

        # Get all registered students
        users = User.collection(self.db).find({
            "faceRegistered": True,
            "role": "student"
        })

        for user in users:
            user_id = str(user["_id"])
            
            # Get embeddings from Supabase
            embeddings_data = get_face_embeddings(user_id)
            
            for emb_data in embeddings_data:
                self.face_database.append({
                    "name": user.get("name", "Unknown"),
                    "user_id": user_id,
                    "email": user.get("email", ""),
                    "embedding": np.array(emb_data["embedding"])
                })

        print(f"[INFO] Loaded {len(self.face_database)} embeddings for {len(set(u['user_id'] for u in self.face_database))} students")
        return len(self.face_database)

    def recognize_face_realtime(self, image_bytes: bytes, analyze_emotion: bool = True) -> Dict:
        """
        Real-time face recognition with tracking and emotion detection.
        Returns list of detected faces with recognition results.
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None:
                return {"success": False, "error": "Invalid image"}

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

            detected_faces = []

            for (x, y, w, h) in faces:
                face_img = frame[y:y+h, x:x+w]

                # Simple tracking based on position
                face_id = None
                for fid, data in self.tracked_faces.items():
                    px, py, pw, ph = data["box"]
                    if abs(px - x) < 60 and abs(py - y) < 60:
                        face_id = fid
                        break

                if face_id is None:
                    face_id = self.next_face_id
                    self.next_face_id += 1
                    self.tracked_faces[face_id] = {
                        "name": "Unknown",
                        "user_id": None,
                        "confidence": 0.0,
                        "emotion": "neutral",
                        "lock": 0,
                        "box": (x, y, w, h)
                    }

                face_data = self.tracked_faces[face_id]
                face_data["box"] = (x, y, w, h)

                # Identity recognition
                if face_data["lock"] > 0:
                    face_data["lock"] -= 1
                else:
                    embedding = self._get_embedding(face_img, MODEL_NAME)
                    
                    if embedding is not None and len(self.face_database) > 0:
                        best_name = "Unknown"
                        best_user_id = None
                        best_dist = 1.0

                        for ref in self.face_database:
                            dist = self._cosine_distance(embedding, ref["embedding"])
                            if dist < best_dist:
                                best_dist = dist
                                best_name = ref["name"]
                                best_user_id = ref["user_id"]

                        match_percent = self._distance_to_percent(best_dist)
                        face_data["confidence"] = match_percent

                        if match_percent >= MATCH_ACCEPT_PERCENT:
                            face_data["name"] = best_name
                            face_data["user_id"] = best_user_id
                            face_data["lock"] = LOCK_FRAMES
                        else:
                            face_data["name"] = "Unknown"
                            face_data["user_id"] = None

                # Emotion detection (throttled)
                if analyze_emotion and self.frame_idx % EMOTION_INTERVAL == 0:
                    try:
                        emo = DeepFace.analyze(
                            face_img,
                            actions=["emotion"],
                            enforce_detection=False
                        )
                        face_data["emotion"] = emo[0]["dominant_emotion"]
                    except:
                        pass

                detected_faces.append({
                    "face_id": face_id,
                    "name": face_data["name"],
                    "user_id": face_data["user_id"],
                    "confidence": face_data["confidence"],
                    "emotion": face_data["emotion"],
                    "bbox": {"x": x, "y": y, "w": w, "h": h}
                })

            self.frame_idx += 1

            return {
                "success": True,
                "faces": detected_faces,
                "frame_idx": self.frame_idx
            }

        except Exception as e:
            print(f"Error in realtime recognition: {str(e)}")
            return {"success": False, "error": str(e)}

    def register_face(self, image_bytes: bytes, user_id: str, user_role: str, exclude_user_id: str = None):
        """Validate single face, get encoding, check duplicate against all other users."""
        emb = self._get_embedding(image_bytes, MODEL_NAME)
        if emb is None:
            return {"success": False, "error": "No face detected or invalid image"}

        # Duplicate check: compare with every other user's encoding
        users = User.collection(self.db).find({"faceRegistered": True, "faceEncoding": {"$exists": True}})
        for u in users:
            if exclude_user_id and str(u["_id"]) == exclude_user_id:
                continue
            enc = u.get("faceEncoding")
            if not enc:
                continue
            sim = self._cosine_similarity(emb, enc)
            if sim >= self.duplicate_threshold:
                return {"success": False, "error": "Face already registered for another user"}

        return {"success": True, "encoding": emb.tolist()}

    def verify(self, image_bytes: bytes):
        """Get face from image, compare with all registered encodings."""
        emb = self._get_embedding(image_bytes, MODEL_NAME)
        if emb is None:
            return {"matched": False, "error": "No face detected"}

        users = User.collection(self.db).find({"faceRegistered": True, "faceEncoding": {"$exists": True}, "role": "student"})
        best_sim = -1
        best_user = None
        for u in users:
            enc = u.get("faceEncoding")
            if not enc:
                continue
            sim = self._cosine_similarity(emb, enc)
            if sim >= self.threshold and sim > best_sim:
                best_sim = sim
                best_user = u

        if best_user is None:
            return {"matched": False}

        return {
            "matched": True,
            "confidence": float(best_sim),
            "user": {
                "id": str(best_user["_id"]),
                "name": best_user.get("name"),
                "email": best_user.get("email"),
            },
        }
