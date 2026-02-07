import numpy as np
import cv2
from deepface import DeepFace
import logging
import tensorflow as tf

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceRecognitionService:
    """
    Singleton Service for Face Recognition (Multi-Model: FaceNet512 + ArcFace).
    Loads models ONCE at startup to prevent memory leaks and slow requests.
    """
    _instance = None
    _models = {}

    def __new__(cls):
        if cls._instance is None:
            logger.info("🌌 [ANTIGRAVITY] Initializing Multi-Model Face Recognition Core...")
            cls._instance = super(FaceRecognitionService, cls).__new__(cls)
            cls._instance._initialize_models()
        return cls._instance

    def _initialize_models(self):
        """
        Loads FaceNet512 and ArcFace models into memory.
        """
        try:
            # Force eager execution to avoid graph issues
            tf.config.run_functions_eagerly(True)
            
            model_names = ["Facenet512", "ArcFace"]
            
            for name in model_names:
                logger.info(f"🔄 Attempting to load model: {name}") 
                self._models[name] = DeepFace.build_model(name)
                logger.info(f"✅ {name} Loaded.")

            logger.info("🚀 [ANTIGRAVITY] Multi-Model Core Ready.")
        except Exception as e:
            logger.error(f"❌ [CRITICAL] Failed to load models: {e}")
            raise RuntimeError("ML Engine Failure") from e

    def generate_embedding(self, img_array):
        """
        Generates embeddings for a given face image using all loaded models.
        Args:
            img_array (numpy array): BGR image from OpenCV
        Returns:
            dict: { "Facenet512": [vector], "ArcFace": [vector] } or None if no face found
        """
        try:
            if img_array is None or img_array.size == 0:
                logger.warning("⚠️ Empty image buffer received.")
                return None

            embeddings = {}
            found_face = False

            # Load Haar Cascade (standard OpenCV)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
            
            # Convert to grayscale for detection
            gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
            
            # Detect faces (using parameters from user script: scaleFactor=1.3, minNeighbors=5)
            # This is key: we use strict parameters to avoid false positives, but loose enough for basic webcams
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                logger.info("❌ No face detected by Haar Cascade")
                return None
                
            # Take the largest face
            (x, y, w, h) = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
            face_bbox = {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
            logger.info(f"📍 Face detected at: {face_bbox}")
            
            # Crop the face
            # DeepFace expects BGR, so we crop from original img_array
            face_img = img_array[y:y+h, x:x+w]

            for model_name, model_obj in self._models.items():
                try:
                    # Pass the *cropped* face to DeepFace
                    # We disable detection since we already found it
                    result = DeepFace.represent(
                        img_path=face_img,
                        model_name=model_name,
                        model=model_obj, # Pass model object for efficiency (if supported by installed version)
                        enforce_detection=False, 
                        detector_backend="skip" # Skip detection inside DeepFace
                    )
                    
                    if result:
                        embeddings[model_name] = result[0]["embedding"]
                        found_face = True
                            
                except TypeError:
                     # Fallback for old DeepFace versions that don't accept 'model' arg
                     result = DeepFace.represent(
                        img_path=face_img,
                        model_name=model_name,
                        enforce_detection=False,
                        detector_backend="skip"
                    )
                     if result:
                        embeddings[model_name] = result[0]["embedding"]
                        found_face = True

                except Exception as ex:
                     logger.warning(f"⚠️ Failed to generate {model_name} embedding: {ex}")

            if not found_face:
                return None

            # Return both embeddings and bbox
            return {"embeddings": embeddings, "bbox": face_bbox}

        except Exception as e:
            logger.error(f"⚠️ Embedding Generation Error: {e}")
            return None

# Global Instance
ml_service = FaceRecognitionService()
