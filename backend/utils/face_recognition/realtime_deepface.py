import cv2
import numpy as np
from deepface import DeepFace
from pathlib import Path

# ===================== CONFIG =====================
DATASET_DIR = "datasets"
MODEL_NAME = "Facenet512"

MAX_DIST = 0.55                 # Facenet512 cosine distance upper bound
MATCH_ACCEPT_PERCENT = 50.0     # ≥ 50% = accept identity
LOCK_FRAMES = 40                # keep identity for N frames
EMOTION_INTERVAL = 15           # analyze emotion every N frames
# =================================================


def cosine_distance(a, b):
    return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def distance_to_percent(distance):
    percent = (1 - distance / MAX_DIST) * 100
    return max(0.0, min(100.0, percent))


# ===================== LOAD MODEL =====================
print("[INFO] Loading Facenet512 model...")
model = DeepFace.build_model(MODEL_NAME)

# ===================== LOAD DATASET =====================
print("[INFO] Loading dataset embeddings...")
database = []

for person_dir in Path(DATASET_DIR).iterdir():
    if not person_dir.is_dir():
        continue

    for img_path in person_dir.glob("*.jpg"):
        embedding = DeepFace.represent(
            img_path=str(img_path),
            model_name=MODEL_NAME,
            enforce_detection=False
        )[0]["embedding"]

        database.append({
            "name": person_dir.name,
            "embedding": np.array(embedding)
        })

print(f"[INFO] Loaded {len(database)} embeddings")

# ===================== CAMERA =====================
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Camera not accessible")

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

tracked_faces = {}
next_face_id = 0
frame_idx = 0

print("[INFO] Facenet512 FINAL recognition started")

# ===================== MAIN LOOP =====================
while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        face_img = frame[y:y+h, x:x+w]

        # -------- SIMPLE TRACKING (POSITION BASED) --------
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

        # -------- IDENTITY RECOGNITION --------
        if face_data["lock"] > 0:
            face_data["lock"] -= 1
        else:
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

        # -------- EMOTION (THROTTLED) --------
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

        # -------- DISPLAY --------
        label = f"{face_data['name']} ({face_data['confidence']:.1f}%) | {face_data['emotion']}"
        color = (0, 255, 0) if face_data["name"] != "Unknown" else (0, 0, 255)

        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        cv2.putText(
            frame,
            label,
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            color,
            2
        )

    frame_idx += 1
    cv2.imshow("Facenet512 FINAL Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
