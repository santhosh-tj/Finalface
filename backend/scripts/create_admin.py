import sys
import os
from datetime import datetime

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv

env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

uri = os.getenv("MONGO_URI")
if not uri:
    print("MONGO_URI not found!")
    sys.exit(1)

try:
    client = MongoClient(uri)
    db_name = os.path.basename(os.getenv("DATABASE_NAME", "face_attendance_system"))
    db = client[db_name]
    
    email = "admin@example.com"
    password = "admin"
    
    # Check if exists
    if db.users.find_one({"email": email}):
        print("Admin user already exists!")
    else:
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user = {
            "email": email,
            "password": hashed_pw,
            "role": "admin",
            "createdAt": datetime.now(),
            "name": "System Admin"
        }
        db.users.insert_one(user)
        print(f"Created admin user successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")

except Exception as e:
    print(f"Error: {e}")
