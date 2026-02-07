# Face Attendance System - Complete Documentation

## 1. Project Overview

### Introduction
The **Face Attendance System** is a modern, web-based application designed to automate and streamline student attendance tracking using facial recognition technology. It eliminates manual roll calls, prevents proxy attendance, and provides real-time analytics for faculty and administrators.

### Core Features
-   **Role-Based Access Control (RBAC)**: Distinct portals for **Admins**, **Faculty**, and **Students**.
-   **Facial Recognition**: Secure, AI-powered face detection and matching using FaceNet/deepface.
-   **Real-Time Attendance**: Instant marking and live monitoring of class attendance.
-   **Geofencing (Optional)**: GPS-based enforcement to ensure students are physically present.
-   **Analytics & Reporting**: Visual dashboards for attendance trends, system health, and user activity.
-   **Modern UI**: Responsive, glassmorphism-inspired design with dark mode support.

### Technology Stack
-   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Axios.
-   **Backend**: Python Flask, Waitress.
-   **Database**: MongoDB (NoSQL).
-   **AI/ML**: OpenCV, FaceNet / deepface.
-   **Authentication**: JWT (JSON Web Tokens), Bcrypt.

---

## 2. System Architecture

### Frontend Structure (`frontend/src`)
The React application is modularized by feature and user role.

-   **`pages/`**:
    -   **`admin/`**: Dashboard, User Management (Students/Faculty), System Analytics, Settings.
    -   **`faculty/`**: Session Creation, Live Attendance Monitor, Reports.
    -   **`student/`**: Face Registration, Attendance History, Mobile Attendance.
    -   **`auth/`**: Login Page with 3D background elements.
-   **`components/`**:
    -   **`webcam/`**: `WebcamFeed` (stream handling), `FaceOverlay` (bounding boxes).
    -   **`layout/`**: `Sidebar`, `Header` (responsive navigation).
    -   **`common/`**: Reusable UI (Buttons, Cards, Modals).
-   **`contexts/`**:
    -   `AuthContext`: Manages user session and JWT storage.
    -   `ThemeContext`: Handles Light/Dark mode toggling.

### Backend Structure (`backend/app`)
The Flask API follows a service-oriented architecture.

-   **`models/`**: MongoDB schemas for `User`, `Attendance`, and `Session`.
-   **`routes/`**:
    -   `/auth`: Login, Face Registration.
    -   `/admin`: CRUD operations for users, System Settings.
    -   `/faculty`: Session management.
    -   `/student`: Attendance marking endpoints.
-   **`services/`**:
    -   **`face_service.py`**: Handles face detection, encoding generation, and matching logic.
    -   **`supabase_storage.py`**: (Optional) Cloud storage integration for images.

---

## 3. Key Workflows

### Face Registration
1.  **Capture**: Student captures their photo via webcam (or uploads one).
2.  **Process**: Backend detects the face and generates a 128-dimensional encoding.
3.  **Store**: The encoding is securely stored in the User's document in MongoDB (not the raw image).

### Marking Attendance
1.  **Session Start**: Faculty starts a class session (generating a unique Session ID).
2.  **Capture**: Student's device captures their current face frame.
3.  **Verify**:
    -   Backend compares the captured face encoding with the logged-in student's stored encoding.
    -   (Optional) Backend verifies if student's GPS coordinates are within range of the class.
4.  **Record**: If matched, an `Attendance` record is created with `status="present"`.

---

## 4. Setup & Installation

### Prerequisites
-   Node.js (v16+)
-   Python (v3.10+)
-   MongoDB (Running locally or Atlas URI)

### Backend Setup
1.  **Navigate**: `cd backend`
2.  **Virtual Env**: `python -m venv venv` -> `venv\Scripts\activate` (Windows)
3.  **Install**: `pip install -r requirements.txt`
4.  **Env Variables**: Create `.env` with `MONGO_URI`, `JWT_SECRET`.
5.  **Run**: `python run.py`

### Frontend Setup
1.  **Navigate**: `cd frontend`
2.  **Install**: `npm install`
3.  **Run**: `npm run dev`

### Access
-   **Web App**: `http://localhost:5173`
-   **API**: `http://localhost:5000`
