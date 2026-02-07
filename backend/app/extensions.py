from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from app.config import Config


def get_mongo():
    client = MongoClient(Config.MONGO_URI)
    return client[Config.DATABASE_NAME]


def create_jwt_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)


def decode_jwt_token(token: str):
    try:
        return jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(roles=None):
    """Decorator: require JWT and optionally specific role(s). roles = ['admin','faculty','student'] or None for any."""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid authorization header"}), 401
            token = auth_header.split(" ")[1]
            payload = decode_jwt_token(token)
            if not payload:
                return jsonify({"error": "Invalid or expired token"}), 401
            request.current_user = payload
            if roles and payload.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapped
    return decorator
