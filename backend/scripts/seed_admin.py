"""Seed one admin user. Run from backend dir: python -m scripts.seed_admin"""
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "face_attendance_system")

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

email = "admin@example.com"
password = "admin123"
name = "Admin"
hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

existing = db.users.find_one({"email": email})
if existing:
    print("Admin already exists:", email)
    sys.exit(0)

db.users.insert_one({
    "role": "admin",
    "name": name,
    "email": email,
    "password": hashed,
    "faceRegistered": False,
    "createdAt": datetime.utcnow(),
})
print("Admin created:", email, "| Password:", password)
