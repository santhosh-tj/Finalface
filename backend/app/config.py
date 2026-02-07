import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "face_attendance_system")
    JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24

    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_BUCKET_NAME = os.getenv("SUPABASE_BUCKET_NAME", "face-images")

    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"

    # Face recognition
    FACE_SIMILARITY_THRESHOLD = 0.6  # cosine similarity; above = same person
    FACE_DUPLICATE_THRESHOLD = 0.7   # reject if new face matches any existing
