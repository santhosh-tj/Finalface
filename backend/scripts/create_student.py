import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'face_attendance_system')

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# Create student
email = 'student@example.com'
password = 'student123'
name = 'Test Student'
role = 'student'

hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
user_data = {
    'email': email,
    'password': hashed_pw,
    'name': name,
    'role': role,
    'faceRegistered': False,
    'createdAt': '2026-02-01T17:30:00.000Z'
}

result = db.users.insert_one(user_data)
print(f'Created student with ID: {result.inserted_id}')
