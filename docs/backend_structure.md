# Backend Documentation

## Directory Structure

```
backend/
├── app/
│   ├── models/         # Database models/schemas (User, Attendance, Session)
│   ├── routes/         # API endpoints (Auth, Admin, Faculty, Student, Face)
│   ├── services/       # Business logic (Face Service, Reporting)
│   ├── utils/          # Helper functions (Security, Validators)
│   ├── extensions.py   # Flask extensions (PyMongo, JWT)
│   └── config.py       # Configuration settings
├── run.py              # Application entry point
└── requirements.txt    # Python dependencies
```

## Database Schema (MongoDB)

### Users Collection (`users`)
-   `_id`: ObjectId
-   `name`: String
-   `email`: String (Unique)
-   `password`: String (Bcrypt Hash)
-   `role`: Enum ("admin", "faculty", "student")
-   `faceRegistered`: Boolean
-   `faceEncoding`: Array (Float) - *Stored only for students/faculty*
-   `class`: String (Optional, for students)
-   `createdAt`: DateTime

### Attendance Collection (`attendance`)
-   `_id`: ObjectId
-   `sessionId`: ObjectId (Ref: sessions)
-   `studentId`: ObjectId (Ref: users)
-   `date`: String (ISO Format YYYY-MM-DD)
-   `timestamp`: DateTime
-   `status`: Enum ("present", "absent", "late")

### Sessions Collection (`sessions`)
-   `_id`: ObjectId
-   `facultyId`: ObjectId (Ref: users)
-   `className`: String
-   `startTime`: DateTime
-   `endTime`: DateTime
-   `isActive`: Boolean
-   `gpsCoordinates`: Object (lat, lng, radius) - *Optional*

## API Endpoints

### Authentication (`/api/auth`)
-   `POST /login`: Authenticate user and return JWT.
-   `POST /register-face`: Register face encoding for the logged-in user.

### Admin (`/api/admin`)
-   `GET /faculty`, `POST /faculty`: Manage faculty accounts.
-   `PUT /faculty/<id>`, `DELETE /faculty/<id>`: Update/Delete faculty.
-   `GET /students`, `POST /students`: Manage student accounts.
-   `PUT /students/<id>`, `DELETE /students/<id>`: Update/Delete students.
-   `GET /settings`, `PATCH /settings`: Manage global system settings (e.g., GPS toggle).

### Faculty (`/api/faculty`)
-   `POST /sessions`: Create a new attendance session.
-   `GET /sessions/active`: Get currently active session.
-   `GET /history`: View attendance history for their classes.

### Student (`/api/student`)
-   `POST /mark-attendance`: Mark attendance for an active session.
-   `GET /history`: View personal attendance records.

## Key Modules

### Face Service (`app/services/face_service.py`)
Handles the core computer vision logic:
-   **Detection**: Locates faces in an image.
-   **Encoding**: Converts face features into a numerical vector.
-   **Matching**: Compares uploaded face encoding with stored user encodings using Euclidean distance.
