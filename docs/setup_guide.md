# Setup Guide

## Prerequisites

-   **Node.js**: v16 or higher
-   **Python**: v3.10 or higher
-   **MongoDB**: Local instance or Atlas URI
-   **Git**: For version control

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd face-attendance-system
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Configure Environment Variables:
Create a `.env` file in `backend/` with:
```env
MONGO_URI=mongodb://localhost:27017/face_attendance_db
JWT_SECRET=your_super_secret_key_change_this
FLASK_ENV=development
```

Run the Server:
```bash
python run.py
```
*Server will start at `http://localhost:5000`*

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Run the Development Server:
```bash
npm run dev
```
*App will be available at `http://localhost:5173`*

## Verification
1.  Open `http://localhost:5173` in your browser.
2.  Login with default admin credentials (if seeded) or register a new admin via the backend CLI (if applicable).
3.  Ensure the webcam permission is granted for face recognition features.
