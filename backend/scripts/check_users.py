import sys
import os

# Add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from pymongo import MongoClient
from dotenv import load_dotenv

env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

uri = os.getenv("MONGO_URI")
if not uri:
    print("MONGO_URI not found!")
    sys.exit(1)

print(f"Connecting to DB...")
try:
    client = MongoClient(uri)
    db_name = os.path.basename(os.getenv("DATABASE_NAME", "face_attendance_system"))
    db = client[db_name]
    
    # Check if 'users' collection exists
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
    
    users = list(db.users.find({}, {"email": 1, "role": 1}))
    
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f" - {u.get('email')} [{u.get('role')}]")
        
except Exception as e:
    print(f"Error: {e}")
