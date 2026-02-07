"""Real-time face recognition with FaceNet512, emotion detection, and tracking."""
import cv2
import numpy as np
from deepface import DeepFace
from pathlib import Path
import sys

# ===================== CONFIG =====================
DATASET_DIR = "datasets"
MODEL_NAME = "Facenet512"

MAX_DIST = 0.55                 # Facenet512 cosine distance upper bound
MATCH_ACCEPT_PERCENT = 50.0     # ≥ 50% = accept identity
LOCK_FRAMES = 40                # keep identity for N frames
EMOTION_INTERVAL = 15           # analyze emotion every N frames
# =================================================


def cosine_distance(a, b):
    """Calculate cosine distance between two embeddings."""
    return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def distance_to_percent(distance):
    """Convert distance to percentage match."""
    percent = (1 - distance / MAX_DIST) * 100
    return max(0.0, min(100.0, percent))


def load_database_from_files(dataset_dir=DATASET_DIR):
    """Load face database from local datasets directory."""
    print("[INFO] Loading dataset embeddings from local files...")
    database = []

    dataset_path = Path(dataset_dir)
    if not dataset_path.exists():
        print(f"[WARNING] Dataset directory '{dataset_dir}' not found")
        return database

    for person_dir in dataset_path.iterdir():
        if not person_dir.is_dir():
            continue

        print(f"[INFO] Loading faces for {person_dir.name}...")
        for img_path in person_dir.glob("*.jpg"):
            try:
                embedding = DeepFace.represent(
                    img_path=str(img_path),
                    model_name=MODEL_NAME,
                    enforce_detection=False
                )[0]["embedding"]

                database.append({
                    "name": person_dir.name,
                    "embedding": np.array(embedding)
                })
            except Exception as e:
                print(f"[WARNING] Failed to load {img_path}: {e}")

    print(f"[INFO] Loaded {len(database)} embeddings")
    return database


def load_database_from_supabase():
    """Load face database from Supabase."""
    try:
        from app.services.supabase_storage import get_face_embeddings
        from app.extensions import get_mongo
        from app.models.user import User
        
        print("[INFO] Loading dataset embeddings from Supabase...")
        database = []
        
        db = get_mongo()
        users = User.collection(db).find({
            "faceRegistered": True,
            "role": "student"
        })
        
        for user in users:
            user_id = str(user["_id"])
            name = user.get("name", "Unknown")
            
            # Get embeddings from Supabase
            embeddings_data = get_face_embeddings(user_id)
            
            for emb_data in embeddings_data:
                database.append({
                    "name": name,
                    "embedding": np.array(emb_data["embedding"])
                })
        
        print(f"[INFO] Loaded {len(database)} embeddings from Supabase")
        return database
        
    except Exception as e:
        print(f"[ERROR] Failed to load from Supabase: {e}")
        return []


def run_realtime_recognition(use_supabase=False):
    """
    Run real-time face recognition with tracking and emotion detection.
    
    Args:
        use_supabase: If True, load database from Supabase. Otherwise use local files.
    """
    # Load model
    print(f"[INFO] Loading {MODEL_NAME} model...")
    model = DeepFace.build_model(MODEL_NAME)

    # Load database
    if use_supabase:
        database = load_database_from_supabase()
    else:
        database = load_database_from_files()
    
    if len(database) == 0:
        print("[ERROR] No face data loaded. Please register faces first.")
        return
    
    print(f"[INFO] Database ready with {len(database)} face samples")

    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Camera not accessible")

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    # Tracking variables
    tracked_faces = {}
    next_face_id = 0
    frame_idx = 0

    print(f"[INFO] {MODEL_NAME} real-time recognition started")
    print("[INFO] Press 'q' to quit")

    # Main loop
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            face_img = frame[y:y+h, x:x+w]

            # Simple tracking (position based)
            face_id = None
            for fid, data in tracked_faces.items():
                px, py, pw, ph = data["box"]
                if abs(px - x) < 60 and abs(py - y) < 60:
                    face_id = fid
                    break

            if face_id is None:
                face_id = next_face_id
                next_face_id += 1
                tracked_faces[face_id] = {
                    "name": "Unknown",
                    "confidence": 0.0,
                    "emotion": "neutral",
                    "lock": 0,
                    "box": (x, y, w, h)
                }

            face_data = tracked_faces[face_id]
            face_data["box"] = (x, y, w, h)

            # Identity recognition
            if face_data["lock"] > 0:
                face_data["lock"] -= 1
            else:
                try:
                    embedding = DeepFace.represent(
                        img_path=face_img,
                        model_name=MODEL_NAME,
                        enforce_detection=False
                    )[0]["embedding"]

                    embedding = np.array(embedding)

                    best_name = "Unknown"
                    best_dist = 1.0

                    for ref in database:
                        dist = cosine_distance(embedding, ref["embedding"])
                        if dist < best_dist:
                            best_dist = dist
                            best_name = ref["name"]

                    match_percent = distance_to_percent(best_dist)
                    face_data["confidence"] = match_percent

                    if match_percent >= MATCH_ACCEPT_PERCENT:
                        face_data["name"] = best_name
                        face_data["lock"] = LOCK_FRAMES
                    else:
                        face_data["name"] = "Unknown"
                except Exception as e:
                    print(f"[WARNING] Recognition failed: {e}")

            # Emotion detection (throttled)
            if frame_idx % EMOTION_INTERVAL == 0:
                try:
                    emo = DeepFace.analyze(
                        face_img,
                        actions=["emotion"],
                        enforce_detection=False
                    )
                    face_data["emotion"] = emo[0]["dominant_emotion"]
                except:
                    pass

            # Display
            label = f"{face_data['name']} ({face_data['confidence']:.1f}%) | {face_data['emotion']}"
            color = (0, 255, 0) if face_data["name"] != "Unknown" else (0, 0, 255)

            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(
                frame,
                label,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2
            )

        # Show frame info
        cv2.putText(
            frame,
            f"Frame: {frame_idx} | Faces: {len(faces)} | DB: {len(database)}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )

        frame_idx += 1
        cv2.imshow(f"{MODEL_NAME} Real-time Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Recognition stopped")


if __name__ == "__main__":
    # Check if should use Supabase
    use_supabase = False
    if len(sys.argv) >= 2 and sys.argv[1].lower() in ['supabase', 'db', 'cloud']:
        use_supabase = True
        print("[INFO] Using Supabase database")
    else:
        print("[INFO] Using local file database")
        print("[INFO] To use Supabase, run: python realtime_recognition.py supabase")
    
    try:
        run_realtime_recognition(use_supabase)
    except KeyboardInterrupt:
        print("\n[INFO] Recognition stopped by user")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
