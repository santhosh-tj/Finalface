import base64
import binascii
import logging
from datetime import datetime, timedelta
from pathlib import Path

import cv2
import numpy as np
from bson import ObjectId
from flask import Blueprint, jsonify, request

from app.extensions import get_mongo, require_auth
from app.models.attendance import Attendance
from app.models.session import Session
from app.models.user import User
from app.services.face_recognition_simple import get_recognizer
from app.services.ml_service import ml_service

bp = Blueprint("face", __name__)
logger = logging.getLogger(__name__)

registration_sessions = {}
liveness_sessions = {}
SESSION_TTL_MINUTES = 10
MIN_ACCEPTED_FRAMES = 6
DATASET_DIR = Path(__file__).resolve().parents[2] / "datasets"
LIVENESS_FREEZE_DIFF = 1.0
LIVENESS_FREEZE_FRAMES = 4
LIVENESS_TTL_SECONDS = 90


def read_image_from_base64(base64_string):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def _bbox_iou(a, b):
    if not a or not b:
        return 0.0
    ax1, ay1, aw, ah = a["x"], a["y"], a["w"], a["h"]
    bx1, by1, bw, bh = b["x"], b["y"], b["w"], b["h"]
    ax2, ay2 = ax1 + aw, ay1 + ah
    bx2, by2 = bx1 + bw, by1 + bh

    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    if inter <= 0:
        return 0.0

    a_area = max(1, aw * ah)
    b_area = max(1, bw * bh)
    return float(inter / max(1.0, a_area + b_area - inter))


def _is_valid_session(session, current_user_id):
    if not session:
        return False, "Invalid session"
    if session["user_id"] != current_user_id:
        return False, "Session does not belong to current user"
    if datetime.utcnow() > session["expires_at"]:
        return False, "Session expired"
    return True, ""


def _cleanup_liveness_cache(now):
    stale_keys = []
    for key, state in liveness_sessions.items():
        updated_at = state.get("updated_at")
        if not updated_at:
            stale_keys.append(key)
            continue
        if (now - updated_at).total_seconds() > LIVENESS_TTL_SECONDS:
            stale_keys.append(key)
    for key in stale_keys:
        liveness_sessions.pop(key, None)


def _assess_liveness(image_bytes: bytes, session_id: str, user_id: str):
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return "unknown", 0.0

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    small = cv2.resize(gray, (48, 48), interpolation=cv2.INTER_AREA)

    now = datetime.utcnow()
    _cleanup_liveness_cache(now)

    key = f"{session_id}:{user_id}"
    prev = liveness_sessions.get(key)
    motion_score = 100.0
    stable_frames = 0

    if prev is not None:
        prev_small = prev.get("small")
        if prev_small is not None and prev_small.shape == small.shape:
            motion_score = float(np.mean(np.abs(small.astype(np.float32) - prev_small.astype(np.float32))))
            if motion_score < LIVENESS_FREEZE_DIFF:
                stable_frames = int(prev.get("stable_frames", 0)) + 1

    liveness_sessions[key] = {
        "small": small,
        "stable_frames": stable_frames,
        "updated_at": now,
    }

    is_fake = stable_frames >= LIVENESS_FREEZE_FRAMES
    return ("fake" if is_fake else "real"), round(motion_score, 3)


@bp.route("/register/start", methods=["POST"])
@require_auth(roles=["student", "faculty"])
def start_register():
    try:
        current_user = request.current_user
        data = request.get_json(silent=True) or {}
        num_images = int(data.get("numImages", 20))
        num_images = max(10, min(num_images, 100))

        session_id = str(ObjectId())
        registration_sessions[session_id] = {
            "user_id": str(current_user["sub"]),
            "embeddings": {"Facenet512": []},
            "samples": [],
            "accepted_count": 0,
            "attempt_count": 0,
            "target": num_images,
            "last_bbox": None,
            "last_embedding": None,
            "start_time": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=SESSION_TTL_MINUTES),
        }

        return jsonify(
            {
                "success": True,
                "sessionId": session_id,
                "numImages": num_images,
                "expiresInSeconds": SESSION_TTL_MINUTES * 60,
            }
        ), 200
    except Exception as e:
        logger.error("Start Register Error: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route("/register/frame", methods=["POST"])
@require_auth(roles=["student", "faculty"])
def register_frame():
    try:
        session_id = request.form.get("sessionId")
        current_user_id = str(request.current_user["sub"])
        session = registration_sessions.get(session_id)
        ok, msg = _is_valid_session(session, current_user_id)
        if not ok:
            return jsonify({"success": False, "error": msg, "reason": "invalid_session"}), 200

        image_file = request.files.get("image")
        if not image_file:
            return jsonify({"success": False, "error": "No image", "reason": "no_image"}), 200

        file_bytes = np.frombuffer(image_file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"success": False, "error": "Invalid image", "reason": "invalid_image"}), 200

        session["attempt_count"] += 1

        result = ml_service.generate_embedding(img)
        if not result:
            return jsonify(
                {
                    "success": False,
                    "error": "No face detected",
                    "reason": "no_face",
                    "guidance": "align_face",
                    "progress": session["accepted_count"],
                    "total": session["target"],
                }
            ), 200

        bbox = result.get("bbox")
        quality = result.get("quality") or {}
        if not quality.get("accepted", True):
            return jsonify(
                {
                    "success": False,
                    "error": "Frame quality rejected",
                    "reason": "low_quality",
                    "guidance": quality.get("guidance", "hold_camera_steady"),
                    "quality": quality,
                    "bbox": bbox,
                    "progress": session["accepted_count"],
                    "total": session["target"],
                }
            ), 200

        if session["last_bbox"] is not None and _bbox_iou(session["last_bbox"], bbox) > 0.97:
            return jsonify(
                {
                    "success": False,
                    "error": "Frame too similar to previous frame",
                    "reason": "duplicate_pose",
                    "guidance": "turn_head_slightly",
                    "bbox": bbox,
                    "progress": session["accepted_count"],
                    "total": session["target"],
                }
            ), 200

        embedding = np.array(result["embeddings"]["Facenet512"], dtype=np.float32)
        if session["last_embedding"] is not None:
            sim = float(np.dot(embedding, session["last_embedding"]))
            if sim > 0.9995:
                return jsonify(
                    {
                        "success": False,
                        "error": "Frame embedding too similar",
                        "reason": "duplicate_embedding",
                        "guidance": "change_angle_or_expression",
                        "bbox": bbox,
                        "progress": session["accepted_count"],
                        "total": session["target"],
                    }
                ), 200

        session["embeddings"]["Facenet512"].append(embedding.tolist())
        session["accepted_count"] += 1
        session["last_bbox"] = bbox
        session["last_embedding"] = embedding

        # Save accepted cropped face sample in-memory; persisted to dataset on complete.
        if bbox:
            x, y, w, h = int(bbox["x"]), int(bbox["y"]), int(bbox["w"]), int(bbox["h"])
            pad = int(max(w, h) * 0.22)
            ih, iw = img.shape[:2]
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(iw, x + w + pad)
            y2 = min(ih, y + h + pad)
            face_crop = img[y1:y2, x1:x2]
            if face_crop.size > 0:
                face_crop = cv2.resize(face_crop, (224, 224))
                ok_enc, jpg = cv2.imencode(".jpg", face_crop, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
                if ok_enc:
                    session["samples"].append(jpg.tobytes())

        return jsonify(
            {
                "success": True,
                "progress": session["accepted_count"],
                "total": session["target"],
                "bbox": bbox,
                "quality": quality,
                "attempted": session["attempt_count"],
                "done": session["accepted_count"] >= session["target"],
                "minRequired": max(MIN_ACCEPTED_FRAMES, int(session["target"] * 0.5)),
            }
        ), 200
    except Exception as e:
        logger.error("Frame Capture Error: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route("/register/complete", methods=["POST"])
@require_auth(roles=["student", "faculty"])
def complete_register():
    try:
        data = request.get_json(silent=True) or {}
        session_id = data.get("sessionId")
        current_user_id = str(request.current_user["sub"])
        session = registration_sessions.get(session_id)
        ok, msg = _is_valid_session(session, current_user_id)
        if not ok:
            return jsonify({"success": False, "error": msg}), 400

        accepted_count = int(session["accepted_count"])
        target = int(session["target"])
        min_required = max(MIN_ACCEPTED_FRAMES, int(target * 0.5))

        if accepted_count < min_required:
            return jsonify(
                {
                    "success": False,
                    "error": f"Not enough quality frames. Captured {accepted_count}, required {min_required}.",
                }
            ), 400

        vectors = np.array(session["embeddings"]["Facenet512"], dtype=np.float32)
        if len(vectors.shape) != 2 or vectors.shape[0] == 0:
            return jsonify({"success": False, "error": "No embeddings captured"}), 400

        norms = np.linalg.norm(vectors, axis=1, keepdims=True) + 1e-9
        vectors = vectors / norms
        avg = np.mean(vectors, axis=0)
        avg = avg / (np.linalg.norm(avg) + 1e-9)
        final_embedding = avg.tolist()
        # Keep multiple prototypes for robust real-time matching.
        max_prototypes = 20
        step = max(1, len(vectors) // max_prototypes)
        prototypes = [vectors[i].tolist() for i in range(0, len(vectors), step)][:max_prototypes]

        db = get_mongo()
        user_oid = ObjectId(current_user_id)
        update_doc = {
            "embeddings": {"Facenet512": final_embedding},
            "embedding": final_embedding,
            "embeddingPrototypes": prototypes,
            "faceEncoding": final_embedding,
            "faceRegistered": True,
            "faceRegisteredAt": datetime.utcnow(),
        }
        User.collection(db).update_one({"_id": user_oid}, {"$set": update_doc})

        # Recognition service caches DB for a few minutes; invalidate so new face works immediately.
        try:
            get_recognizer().invalidate_cache()
        except Exception:
            pass

        # Persist dataset samples for training/debugging.
        user_dataset_dir = DATASET_DIR / current_user_id
        user_dataset_dir.mkdir(parents=True, exist_ok=True)

        for idx, sample_bytes in enumerate(session.get("samples", []), start=1):
            sample_path = user_dataset_dir / f"face_{idx:03d}.jpg"
            with open(sample_path, "wb") as f:
                f.write(sample_bytes)

        del registration_sessions[session_id]

        return jsonify(
            {
                "success": True,
                "captured": accepted_count,
                "target": target,
                "minRequired": min_required,
                "datasetPath": str(user_dataset_dir),
                "datasetCount": len(session.get("samples", [])),
            }
        ), 200
    except Exception as e:
        logger.error("Complete Register Error: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


@bp.route("/recognize", methods=["POST"])
def recognize_face():
    try:
        data = request.get_json(silent=True) or {}
        image_data = data.get("image")
        if not image_data:
            return jsonify({"error": "Missing image"}), 400

        img = read_image_from_base64(image_data)
        result = ml_service.generate_embedding(img)

        if result is None:
            return jsonify({"match": False, "message": "No face detected"}), 200

        return jsonify(
            {
                "match": True,
                "confidence": 0.98,
                "bbox": result.get("bbox"),
            }
        ), 200
    except Exception as e:
        logger.error("Recognition Error: %s", e)
        return jsonify({"error": str(e)}), 500


@bp.route("/verify", methods=["POST"])
def verify_face():
    try:
        data = request.get_json(silent=True) or {}
        session_id = data.get("sessionId")
        image_b64 = data.get("image")
        auto_mark = data.get("autoMark", True)

        if not session_id or not image_b64 or not isinstance(image_b64, str):
            return jsonify({"error": "Session ID and image required"}), 400

        if "," in image_b64:
            image_b64 = image_b64.split(",")[1]

        try:
            image_bytes = base64.b64decode(image_b64)
        except (binascii.Error, ValueError):
            return jsonify({"error": "Invalid image payload"}), 400

        recognizer = get_recognizer()
        db = get_mongo()
        try:
            result = recognizer.recognize_face(image_bytes, db)
        except Exception as ex:
            logger.error("Recognizer failed: %s", ex)
            return jsonify(
                {
                    "matched": False,
                    "user": None,
                    "attendanceMarked": False,
                    "alreadyMarked": False,
                    "faces_detected": 0,
                }
            ), 200

        if result is None:
            return jsonify(
                {
                    "matched": False,
                    "user": None,
                    "attendanceMarked": False,
                    "alreadyMarked": False,
                    "faces_detected": 0,
                }
            )

        if not result.get("matched"):
            return jsonify(
                {
                    "matched": False,
                    "user": None,
                    "attendanceMarked": False,
                    "alreadyMarked": False,
                    "confidence": result.get("confidence", 0),
                    "bbox": result.get("bbox"),
                    "faces_detected": 1,
                }
            )

        user_data = {
            "id": str(result["user_id"]),
            "name": result["name"],
            "rollNo": result.get("rollNo", ""),
            "confidence": result["confidence"],
        }
        liveness_status, motion_score = _assess_liveness(
            image_bytes=image_bytes,
            session_id=session_id,
            user_id=user_data["id"],
        )

        session_obj = Session.collection(db).find_one({"sessionId": session_id})
        if not session_obj:
            return jsonify({"error": "Session not found"}), 404

        existing = Attendance.collection(db).find_one(
            {"sessionId": session_id, "studentId": str(result["user_id"])}
        )

        already_marked = existing is not None
        attendance_marked = False

        if auto_mark and liveness_status == "real" and not already_marked and result["confidence"] >= 50:
            try:
                Attendance.collection(db).insert_one(
                    {
                        "sessionId": session_id,
                        "studentId": str(result["user_id"]),
                        "timestamp": datetime.utcnow(),
                        "status": "present",
                        "confidence": result["confidence"],
                    }
                )

                Session.collection(db).update_one(
                    {"sessionId": session_id},
                    {"$inc": {"presentCount": 1}},
                )
                attendance_marked = True
            except Exception as ex:
                logger.warning("Failed to mark attendance: %s", ex)

        return jsonify(
            {
                "matched": True,
                "user": user_data,
                "confidence": result["confidence"],
                "attendanceMarked": attendance_marked,
                "alreadyMarked": already_marked,
                "bbox": result.get("bbox"),
                "faces_detected": 1,
                "livenessStatus": liveness_status,
                "motionScore": motion_score,
            }
        )
    except Exception as e:
        logger.error("Verify error: %s", e)
        return jsonify(
            {
                "matched": False,
                "user": None,
                "attendanceMarked": False,
                "alreadyMarked": False,
                "faces_detected": 0,
                "error": "verify_failed",
            }
        ), 200
