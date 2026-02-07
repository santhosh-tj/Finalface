# Project Overview

## Face Attendance System

A comprehensive web application for managing student attendance using facial recognition technology. The system provides role-based access for Administrators, Faculty, and Students, enabling seamless attendance tracking, reporting, and analytics.

## Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **State Management**: React Context API
-   **Routing**: React Router DOM
-   **HTTP Client**: Axios

### Backend
-   **Framework**: Flask (Python)
-   **Database**: MongoDB (via PyMongo)
-   **Authentication**: JWT (JSON Web Tokens)
-   **Computer Vision**: OpenCV, FaceNet / deepface
-   **WSGI Server**: Waitress (for production-like serving)

## Key Features

### 1. Role-Based Access Control (RBAC)
-   **Admin**: Manage users (faculty, students), view system-wide analytics, configure global settings (e.g., GPS enforcement).
-   **Faculty**: Create attendance sessions, monitor live attendance, view reports.
-   **Student**: Register face, mark attendance (via mobile/webcam), view personal attendance history.

### 2. Facial Recognition
-   **Registration**: Students register their unique face encoding securely.
-   **Verification**: Real-time face detection and matching during attendance sessions.
-   **Liveness Detection**: Basic checks to prevent spoofing (implementation dependent).

### 3. Real-Time Analytics
-   **Live Monitoring**: Faculty can see students checking in real-time.
-   **Dashboards**: Visual charts and graphs for attendance trends, daily activity, and system health.

### 4. Advanced Security
-   **Geofencing**: Optional GPS enforcement to ensure students are physically present in the classroom.
-   **Secure Storage**: Passwords hashed with Bcrypt; face encodings stored securely in MongoDB.
