from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import get_mongo


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=["*"], allow_headers=["Content-Type", "Authorization"], supports_credentials=True)

    db = get_mongo()
    app.db = db

    from app.routes import auth, admin, faculty, student, sessions, attendance, face, recognize
    app.register_blueprint(auth.bp, url_prefix="/api/auth")
    app.register_blueprint(admin.bp, url_prefix="/api/admin")
    app.register_blueprint(faculty.bp, url_prefix="/api/faculty")
    app.register_blueprint(student.bp, url_prefix="/api/student")
    app.register_blueprint(sessions.bp, url_prefix="/api/sessions")
    app.register_blueprint(attendance.bp, url_prefix="/api/attendance")
    app.register_blueprint(face.bp, url_prefix="/api/face")
    app.register_blueprint(recognize.bp)  # No prefix, defined in blueprint

    return app
