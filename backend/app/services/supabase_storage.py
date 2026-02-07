import os
import json
from pathlib import Path
from typing import List, Dict, Optional, Union, Tuple
from datetime import datetime
import numpy as np

from app.config import Config

# Lazy init to avoid import errors if supabase not configured
_client = None


def _get_client():
    global _client
    if _client is None:
        from supabase import create_client
        if not all([Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY, Config.SUPABASE_BUCKET_NAME]):
            raise ValueError("Missing Supabase configuration")
        _client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)
    return _client


def upload_face_image(student_id: str, filename: str, image_path: Union[str, Path]) -> Optional[str]:
    """
    Upload a face image to Supabase storage.
    
    Args:
        student_id: ID of the student
        filename: Name of the file to save as
        image_path: Path to the image file or bytes
        
    Returns:
        Public URL of the uploaded image or None if upload failed
    """
    try:
        client = _get_client()
        bucket = Config.SUPABASE_BUCKET_NAME
        
        # Create path in format: faces/student_id/filename
        path = f"faces/{student_id}/{filename}"
        
        # Read the image file if path is provided
        if isinstance(image_path, (str, Path)):
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
        else:
            image_bytes = image_path
        
        # Upload the image
        client.storage.from_(bucket).upload(
            path=path,
            file=image_bytes,
            file_options={
                'content-type': 'image/jpeg',
                'upsert': 'true'
            }
        )
        
        # Make the file public
        client.storage.from_(bucket).update_public_access(True)
        
        # Return the public URL
        base = Config.SUPABASE_URL.rstrip("/")
        return f"{base}/storage/v1/object/public/{bucket}/{path}"
        
    except Exception as e:
        print(f"Error uploading face image: {str(e)}")
        return None


def download_face_image(student_id: str, filename: str) -> Optional[bytes]:
    """
    Download a face image from Supabase storage.
    
    Args:
        student_id: ID of the student
        filename: Name of the file to download
        
    Returns:
        Image bytes or None if download failed
    """
    try:
        client = _get_client()
        bucket = Config.SUPABASE_BUCKET_NAME
        path = f"faces/{student_id}/{filename}"
        
        response = client.storage.from_(bucket).download(path)
        return response
        
    except Exception as e:
        print(f"Error downloading face image: {str(e)}")
        return None


def list_student_faces(student_id: str) -> List[Dict]:
    """
    List all face images for a student.
    
    Args:
        student_id: ID of the student
        
    Returns:
        List of file information dictionaries
    """
    try:
        client = _get_client()
        bucket = Config.SUPABASE_BUCKET_NAME
        path = f"faces/{student_id}"
        
        files = client.storage.from_(bucket).list(path)
        return files or []
        
    except Exception as e:
        print(f"Error listing student faces: {str(e)}")
        return []


def save_face_embedding(student_id: str, embedding: np.ndarray, metadata: Optional[Dict] = None) -> bool:
    """
    Save face embedding to the database.
    
    Args:
        student_id: ID of the student
        embedding: Face embedding vector
        metadata: Additional metadata to store with the embedding
        
    Returns:
        True if successful, False otherwise
    """
    try:
        client = _get_client()
        
        # Convert numpy array to list for JSON serialization
        embedding_list = embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)
        
        data = {
            'student_id': student_id,
            'embedding': embedding_list,
            'created_at': datetime.utcnow().isoformat(),
            'metadata': metadata or {}
        }
        
        # Insert into the 'face_embeddings' table
        response = client.table('face_embeddings').insert(data).execute()
        
        return True if response.data else False
        
    except Exception as e:
        print(f"Error saving face embedding: {str(e)}")
        return False


def delete_student_faces(student_id: str) -> bool:
    """
    Delete all face images and embeddings for a student.
    
    Args:
        student_id: ID of the student
        
    Returns:
        True if successful, False otherwise
    """
    try:
        client = _get_client()
        bucket = Config.SUPABASE_BUCKET_NAME
        
        # Delete face images from storage
        path = f"faces/{student_id}"
        client.storage.from_(bucket).remove([f"{path}/{f['name']}" for f in list_student_faces(student_id)])
        
        # Delete embeddings from database
        client.table('face_embeddings').delete().eq('student_id', student_id).execute()
        
        return True
        
    except Exception as e:
        print(f"Error deleting student faces: {str(e)}")
        return False


def upload_multiple_faces(student_id: str, face_images: List[Tuple[str, bytes]]) -> List[str]:
    """
    Upload multiple face images in batch for a student.
    
    Args:
        student_id: ID of the student
        face_images: List of tuples (filename, image_bytes)
        
    Returns:
        List of public URLs for uploaded images
    """
    try:
        client = _get_client()
        bucket = Config.SUPABASE_BUCKET_NAME
        uploaded_urls = []
        
        for filename, image_bytes in face_images:
            path = f"faces/{student_id}/train/{filename}"
            
            # Upload the image
            client.storage.from_(bucket).upload(
                path=path,
                file=image_bytes,
                file_options={
                    'content-type': 'image/jpeg',
                    'upsert': 'true'
                }
            )
            
            # Get public URL
            base = Config.SUPABASE_URL.rstrip("/")
            url = f"{base}/storage/v1/object/public/{bucket}/{path}"
            uploaded_urls.append(url)
        
        print(f"[INFO] Uploaded {len(uploaded_urls)} face images for student {student_id}")
        return uploaded_urls
        
    except Exception as e:
        print(f"Error uploading multiple faces: {str(e)}")
        return []


def save_multiple_embeddings(student_id: str, embeddings: List[np.ndarray], metadata: Optional[Dict] = None) -> bool:
    """
    Save multiple face embeddings for a student.
    
    Args:
        student_id: ID of the student
        embeddings: List of face embedding vectors
        metadata: Additional metadata to store with the embeddings
        
    Returns:
        True if successful, False otherwise
    """
    try:
        client = _get_client()
        
        # First, delete existing embeddings for this student
        client.table('face_embeddings').delete().eq('student_id', student_id).execute()
        
        # Insert new embeddings
        for idx, embedding in enumerate(embeddings):
            embedding_list = embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)
            
            data = {
                'student_id': student_id,
                'embedding': embedding_list,
                'embedding_index': idx,
                'created_at': datetime.utcnow().isoformat(),
                'metadata': metadata or {}
            }
            
            client.table('face_embeddings').insert(data).execute()
        
        print(f"[INFO] Saved {len(embeddings)} embeddings for student {student_id}")
        return True
        
    except Exception as e:
        print(f"Error saving multiple embeddings: {str(e)}")
        return False


def get_face_embeddings(student_id: Optional[str] = None) -> List[Dict]:
    """
    Retrieve face embeddings from the database.
    
    Args:
        student_id: Optional student ID to filter by
        
    Returns:
        List of face embedding records
    """
    try:
        client = _get_client()
        
        if student_id:
            response = client.table('face_embeddings').select('*').eq('student_id', student_id).execute()
        else:
            response = client.table('face_embeddings').select('*').execute()
            
        return response.data or []
        
    except Exception as e:
        print(f"Error retrieving face embeddings: {str(e)}")
        return []
