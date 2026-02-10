import logging
from typing import Dict, Optional, Tuple

import cv2
import numpy as np
from deepface import DeepFace
import tensorflow as tf

logger = logging.getLogger(__name__)

MODEL_NAME = "Facenet512"


class FaceRecognitionService:
    """
    OpenCV + FaceNet service.
    - Detects face using OpenCV Haar Cascade
    - Generates FaceNet512 embeddings from cropped face
    - Returns quality metrics for registration gating
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FaceRecognitionService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        tf.config.run_functions_eagerly(True)
        self.model = DeepFace.build_model(MODEL_NAME)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        logger.info("FaceRecognitionService initialized with OpenCV + Facenet512")

    def _decode_image(self, img_array: np.ndarray) -> Optional[np.ndarray]:
        if img_array is None:
            return None
        if isinstance(img_array, np.ndarray):
            return img_array
        return None

    def _detect_largest_face(self, img: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=6,
            minSize=(80, 80),
        )
        if len(faces) == 0:
            return None
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        return int(x), int(y), int(w), int(h)

    def _crop_with_padding(self, img: np.ndarray, bbox: Tuple[int, int, int, int], pad_ratio: float = 0.22):
        x, y, w, h = bbox
        ih, iw = img.shape[:2]
        pad = int(max(w, h) * pad_ratio)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(iw, x + w + pad)
        y2 = min(ih, y + h + pad)
        return img[y1:y2, x1:x2]

    def _frame_quality(self, img: np.ndarray, bbox: Tuple[int, int, int, int]) -> Dict:
        x, y, w, h = bbox
        ih, iw = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        brightness = float(gray.mean())
        blur = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        face_ratio = float((w * h) / max(1, iw * ih))
        cx = x + (w / 2.0)
        cy = y + (h / 2.0)
        center_offset = float(
            np.sqrt(((cx - iw / 2.0) / max(1, iw / 2.0)) ** 2 + ((cy - ih / 2.0) / max(1, ih / 2.0)) ** 2)
        )

        reasons = []
        if brightness < 55:
            reasons.append("too_dark")
        if brightness > 210:
            reasons.append("too_bright")
        if blur < 80:
            reasons.append("blurry")
        if face_ratio < 0.08:
            reasons.append("face_too_small")
        if face_ratio > 0.65:
            reasons.append("face_too_close")
        if center_offset > 0.55:
            reasons.append("face_not_centered")

        guidance = "good_frame"
        if reasons:
            if "too_dark" in reasons:
                guidance = "increase_light"
            elif "too_bright" in reasons:
                guidance = "reduce_light"
            elif "blurry" in reasons:
                guidance = "hold_camera_steady"
            elif "face_too_small" in reasons:
                guidance = "move_closer"
            elif "face_too_close" in reasons:
                guidance = "move_back"
            else:
                guidance = "center_face"

        return {
            "accepted": len(reasons) == 0,
            "reasons": reasons,
            "guidance": guidance,
            "brightness": round(brightness, 2),
            "blur": round(blur, 2),
            "faceRatio": round(face_ratio, 4),
            "centerOffset": round(center_offset, 4),
        }

    def _embed_face(self, face_img: np.ndarray) -> Optional[np.ndarray]:
        try:
            try:
                result = DeepFace.represent(
                    img_path=face_img,
                    model_name=MODEL_NAME,
                    model=self.model,
                    enforce_detection=False,
                    detector_backend="skip",
                )
            except TypeError:
                result = DeepFace.represent(
                    img_path=face_img,
                    model_name=MODEL_NAME,
                    enforce_detection=False,
                    detector_backend="skip",
                )

            if not result:
                return None

            embedding = result[0]["embedding"] if isinstance(result, list) else result["embedding"]
            vector = np.array(embedding, dtype=np.float32)
            norm = np.linalg.norm(vector)
            if norm <= 1e-9:
                return None
            return vector / norm
        except Exception as ex:
            logger.warning("Embedding generation failed: %s", ex)
            return None

    def generate_embedding(self, img_array: np.ndarray) -> Optional[Dict]:
        """
        Returns:
        {
          "embeddings": { "Facenet512": [float...] },
          "bbox": {"x":int,"y":int,"w":int,"h":int},
          "quality": {...}
        }
        """
        try:
            img = self._decode_image(img_array)
            if img is None or img.size == 0:
                return None

            bbox = self._detect_largest_face(img)
            if bbox is None:
                return None

            quality = self._frame_quality(img, bbox)
            face_img = self._crop_with_padding(img, bbox)
            embedding = self._embed_face(face_img)
            if embedding is None:
                return None

            x, y, w, h = bbox
            return {
                "embeddings": {MODEL_NAME: embedding.tolist()},
                "bbox": {"x": x, "y": y, "w": w, "h": h},
                "quality": quality,
            }
        except Exception as ex:
            logger.error("generate_embedding failed: %s", ex)
            return None


ml_service = FaceRecognitionService()
