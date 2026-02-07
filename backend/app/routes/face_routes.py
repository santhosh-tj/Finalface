from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import cv2
import numpy as np
from deepface import DeepFace
from pathlib import Path
import uuid
from datetime import datetime

from app.services.supabase_storage import upload_face_image, get_face_images
from app.services.face_service import (
    process_face_image,
    extract_face_embedding,
    compare_faces
)

router = APIRouter()

# Configuration
FACE_DATASET_DIR = "datasets"
FACE_SIZE = (160, 160)
MIN_CONFIDENCE = 0.7

# Create dataset directory if not exists
Path(FACE_DATASET_DIR).mkdir(parents=True, exist_ok=True)

@router.post("/register")
async def register_face(
    student_id: str,
    images: List[UploadFile] = File(...)
):
    """
    Register a new face by uploading multiple images.
    Extracts face embeddings and stores them in the database.
    """
    try:
        student_dir = Path(FACE_DATASET_DIR) / student_id
        student_dir.mkdir(parents=True, exist_ok=True)
        
        saved_paths = []
        
        for img_file in images:
            # Save image temporarily
            img_data = await img_file.read()
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Process and save face
            face_img = process_face_image(img)
            if face_img is None:
                continue
                
            # Generate unique filename
            filename = f"{uuid.uuid4()}.jpg"
            save_path = student_dir / filename
            
            # Save processed face image
            cv2.imwrite(str(save_path), face_img)
            
            # Upload to Supabase
            public_url = upload_face_image(student_id, filename, str(save_path))
            saved_paths.append(public_url)
            
            # Remove local copy after upload
            os.remove(save_path)
            
        return {"status": "success", "message": f"Saved {len(saved_paths)} face images", "saved_paths": saved_paths}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recognize")
async def recognize_face(
    image: UploadFile = File(...),
    threshold: float = 0.6
):
    """
    Recognize a face from an uploaded image.
    Returns the best matching student ID and confidence score.
    """
    try:
        # Read and process the uploaded image
        img_data = await image.read()
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process face and extract embedding
        face_img = process_face_image(img)
        if face_img is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")
            
        target_embedding = extract_face_embedding(face_img)
        
        # Get all registered face embeddings from Supabase
        registered_faces = get_face_images()
        
        best_match = None
        best_score = 0
        
        # Compare with all registered faces
        for face_data in registered_faces:
            score = compare_faces(target_embedding, face_data['embedding'])
            if score > best_score and score >= threshold:
                best_score = score
                best_match = face_data['student_id']
        
        if best_match is None:
            return {"status": "not_found", "message": "No matching face found"}
            
        return {
            "status": "success",
            "student_id": best_match,
            "confidence": float(best_score)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mark-attendance")
async def mark_attendance(
    student_id: str,
    class_id: str,
    image: UploadFile = File(...)
):
    """
    Mark attendance by recognizing a face and recording the attendance.
    """
    try:
        # First recognize the face
        recognition_result = await recognize_face(image)
        
        if recognition_result["status"] != "success":
            return {"status": "error", "message": "Face recognition failed"}
            
        if recognition_result["student_id"] != student_id:
            return {
                "status": "mismatch",
                "message": "Face does not match the provided student ID",
                "detected_id": recognition_result["student_id"],
                "confidence": recognition_result["confidence"]
            }
            
        # Here you would typically save the attendance record to your database
        # For example:
        # attendance_record = {
        #     "student_id": student_id,
        #     "class_id": class_id,
        #     "timestamp": datetime.utcnow(),
        #     "verified": True,
        #     "confidence": recognition_result["confidence"]
        # }
        # save_attendance(attendance_record)
        
        return {
            "status": "success",
            "message": "Attendance marked successfully",
            "student_id": student_id,
            "class_id": class_id,
            "timestamp": datetime.utcnow().isoformat(),
            "confidence": recognition_result["confidence"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
