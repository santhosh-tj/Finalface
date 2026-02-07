"""Face capture utility with FaceNet512 and Supabase integration."""
import cv2
import sys
import numpy as np
from pathlib import Path
from deepface import DeepFace

# Configuration
FACE_SIZE = (224, 224)
MODEL_NAME = "Facenet512"
DEFAULT_COUNT = 50


def capture_faces(name: str, count: int = DEFAULT_COUNT, upload_to_supabase: bool = False):
    """
    Capture face images for training.
    
    Args:
        name: Person's name/ID
        count: Number of images to capture (30-100)
        upload_to_supabase: Whether to upload to Supabase storage
    """
    save_dir = Path("datasets") / name
    save_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Camera not found")

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    print(f"[INFO] Capturing {count} face images for {name}")
    print("[INFO] Press 'q' to quit early")
    print("[INFO] Position your face in the camera and move slightly for variety")

    i = 0
    frame_count = 0
    captured_faces = []

    while i < count:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        # Display frame
        display_frame = frame.copy()
        
        for (x, y, w, h) in faces:
            # Draw rectangle
            cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Capture every 5th frame to get variety
            if frame_count % 5 == 0 and i < count:
                face = frame[y:y+h, x:x+w]
                face = cv2.resize(face, FACE_SIZE)
                
                # Save image
                filename = f"{i:03d}.jpg"
                file_path = save_dir / filename
                cv2.imwrite(str(file_path), face)
                captured_faces.append(str(file_path))
                
                i += 1
                print(f"[INFO] Captured {i}/{count}")
            
            # Show progress
            cv2.putText(display_frame, f"Captured: {i}/{count}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Show quality tips
            if w < 150 or h < 150:
                cv2.putText(display_frame, "Move closer!", (10, 70),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
        cv2.imshow("Capture Faces", display_frame)
        
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        
        frame_count += 1

    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\n[INFO] Capture complete! Saved {i} images to {save_dir}")
    
    # Generate embeddings
    if i >= 30:
        print(f"[INFO] Generating embeddings using {MODEL_NAME}...")
        embeddings = []
        
        for img_path in captured_faces:
            try:
                embedding = DeepFace.represent(
                    img_path=img_path,
                    model_name=MODEL_NAME,
                    enforce_detection=False
                )
                if isinstance(embedding, list):
                    embeddings.append(embedding[0]["embedding"])
                else:
                    embeddings.append(embedding["embedding"])
            except Exception as e:
                print(f"[WARNING] Failed to generate embedding for {img_path}: {e}")
        
        print(f"[INFO] Generated {len(embeddings)} embeddings")
        
        # Upload to Supabase if requested
        if upload_to_supabase:
            try:
                # Import here to avoid dependency issues
                from app.services.supabase_storage import upload_multiple_faces, save_multiple_embeddings
                
                print("[INFO] Uploading to Supabase...")
                
                # Prepare images
                face_images = []
                for path in captured_faces:
                    filename = Path(path).name
                    with open(path, 'rb') as f:
                        face_images.append((filename, f.read()))
                
                # Upload images
                urls = upload_multiple_faces(name, face_images)
                print(f"[INFO] Uploaded {len(urls)} images to Supabase")
                
                # Save embeddings
                success = save_multiple_embeddings(name, embeddings)
                if success:
                    print("[INFO] Successfully saved embeddings to database")
                else:
                    print("[WARNING] Failed to save embeddings to database")
                    
            except Exception as e:
                print(f"[ERROR] Failed to upload to Supabase: {e}")
    else:
        print(f"[WARNING] Captured only {i} images, need at least 30 for registration")
    
    return save_dir


if __name__ == "__main__":
    if len(sys.argv) < 2:
        name = input("Enter person name/ID: ").strip()
    else:
        name = sys.argv[1]
    
    # Get count if provided
    count = DEFAULT_COUNT
    if len(sys.argv) >= 3:
        try:
            count = int(sys.argv[2])
            if count < 30 or count > 100:
                print("[WARNING] Count should be between 30 and 100. Using default 50.")
                count = DEFAULT_COUNT
        except ValueError:
            print("[WARNING] Invalid count. Using default 50.")
    
    # Check if should upload to Supabase
    upload = False
    if len(sys.argv) >= 4 and sys.argv[3].lower() in ['true', 'yes', '1']:
        upload = True
    
    try:
        capture_faces(name, count, upload)
        print("\n[SUCCESS] Face capture completed successfully!")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
