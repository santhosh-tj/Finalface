# Face Recognition System - Quick Start Guide

## Overview

This face attendance system now uses **FaceNet512** for high-accuracy face recognition with support for:
- Multi-image registration (50 face datasets per student)
- Real-time face recognition with emotion detection
- Face tracking across video frames
- Webcam and mobile camera modes
- Supabase cloud storage integration

## Prerequisites

### Python Dependencies

Make sure all required packages are installed:

```bash
cd backend
pip install -r requirements.txt
```

Key packages:
- `deepface==0.0.92` - Face recognition library
- `opencv-python==4.8.1.78` - Computer vision
- `numpy==1.26.4` - Numerical operations
- `supabase==2.4.0` - Cloud storage

### Supabase Setup

1. **Create Supabase Project** (if not already done)
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and API keys

2. **Create Storage Bucket**
   ```sql
   -- In Supabase SQL Editor
   -- Bucket is created automatically on first upload
   -- Or create manually in Supabase Dashboard: Storage > New Bucket
   -- Bucket name: face-images
   -- Make it public for image access
   ```

3. **Create face_embeddings Table**
   ```sql
   CREATE TABLE face_embeddings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id TEXT NOT NULL,
     embedding JSONB NOT NULL,
     embedding_index INTEGER,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     metadata JSONB
   );

   -- Add index for faster lookups
   CREATE INDEX idx_face_embeddings_student_id ON face_embeddings(student_id);
   ```

4. **Update .env File**
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_BUCKET_NAME=face-images
   ```
 
## Running the Application

### Start Backend

```bash
cd backend
python run.py
```

Backend will start on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm install  # if first time
npm run dev
```

Frontend will start on `http://localhost:5173`

## Testing the System

### 1. Register a Test Student

**Via Web App:**
1. Create a student account (if not exists)
2. Login as student
3. Navigate to "Register Face" page
4. Click "Start Face Registration"
5. Wait while 50 images are captured
6. Verify success message

**Via Command Line:**
```bash
cd backend/utils/face_recognition
python capture_faces.py "test_student_id" 50 true
```

### 2. Test Real-Time Recognition

**Via Web App (Faculty):**
1. Login as faculty
2. Create new attendance session (Webcam mode)
3. Start session
4. Have registered student appear in front of camera
5. Verify face is recognized with green box

**Via Command Line:**
```bash
cd backend/utils/face_recognition

# Use Supabase database
python realtime_recognition.py supabase

# Or use local datasets directory
python realtime_recognition.py
```

### 3. Test Mobile Attendance

1. Login as student (on mobile or browser)
2. Navigate to "Mobile Attendance"
3. Select active mobile session
4. Allow camera and location access
5. Capture selfie
6. Verify attendance marked

## Configuration

### Adjust Recognition Threshold

Edit `backend/app/services/face_service.py`:

```python
MATCH_ACCEPT_PERCENT = 50.0  # Lower = stricter, Higher = more lenient
```

### Change Number of Training Images

Edit `backend/app/services/face_service.py`:

```python
NUM_TRAINING_IMAGES = 50  # Range: 30-100
```

Or pass as parameter in frontend:
```jsx
<FaceCaptureComponent numImages={30} />
```

### Switch Face Recognition Model

Edit `backend/app/services/face_service.py`:

```python
MODEL_NAME = "Facenet512"  
# Options: "Facenet", "Facenet512", "ArcFace", "VGG-Face", "Dlib"
```

## Troubleshooting

### Camera Access Issues

**Error**: "Camera not accessible"
- Check browser permissions (Chrome: Settings > Privacy > Camera)
- Ensure no other application is using the camera
- Try different browser (Chrome/Edge recommended)

### Face Not Detected

**Error**: "No face detected"
- Ensure good lighting
- Face camera directly
- Remove glasses/hats
- Move closer to camera
- Check webcam is working

### Low Recognition Confidence

**Issue**: Confidence always below 50%
- Re-register with better lighting
- Capture more variety in facial angles
- Ensure same person in registration and recognition
- Check if model is loaded correctly

### Supabase Upload Failures

**Error**: "Failed to upload to storage"
- Verify Supabase credentials in `.env`
- Check internet connection
- Ensure bucket exists and is accessible
- Verify service role key has write permissions

### Performance Issues

**Issue**: Recognition is slow
- Reduce `EMOTION_INTERVAL` (analyze emotion less frequently)
- Increase `LOCK_FRAMES` (re-process faces less often)
- Switch to lighter model (`Facenet` instead of `Facenet512`)
- Use GPU acceleration if available

## API Endpoints

### Registration

```
POST /api/face/register/start
POST /api/face/register/frame
POST /api/face/register/complete
```

### Recognition

```
POST /api/face/recognize/realtime
POST /api/face/attendance/mark
POST /api/face/verify (legacy)
```

## File Structure

```
backend/
├── app/
│   ├── services/
│   │   ├── face_service.py          # Main face recognition logic
│   │   └── supabase_storage.py      # Cloud storage integration
│   └── routes/
│       └── face.py                  # API endpoints
└── utils/
    └── face_recognition/
        ├── capture_faces.py         # CLI registration tool
        └── realtime_recognition.py  # CLI recognition tool

frontend/
├── src/
│   ├── components/
│   │   ├── FaceCaptureComponent.jsx    # Registration UI
│   │   └── FaceRecognitionComponent.jsx # Recognition UI
│   └── pages/
│       ├── RegisterFacePage.jsx         # Student registration
│       ├── LiveAttendancePage.jsx       # Faculty webcam attendance
│       └── MobileAttendancePage.jsx     # Student mobile attendance
```

## Support

For detailed implementation details, see:
- [walkthrough.md](file:///C:/Users/HP%20830%20G5/.gemini/antigravity/brain/5f8fd978-1a71-4f0a-a05f-868abbdab25a/walkthrough.md) - Complete walkthrough
- [implementation_plan.md](file:///C:/Users/HP%20830%20G5/.gemini/antigravity/brain/5f8fd978-1a71-4f0a-a05f-868abbdab25a/implementation_plan.md) - Implementation plan

## Quick Commands

```bash
# Start backend
cd backend && python run.py

# Start frontend
cd frontend && npm run dev

# Test registration CLI
cd backend/utils/face_recognition && python capture_faces.py "student_id" 50 true

# Test recognition CLI
cd backend/utils/face_recognition && python realtime_recognition.py supabase
```

## Success Criteria

✅ Student can register 50 face images
✅ Images uploaded to Supabase storage
✅ Embeddings saved to database
✅ Faculty can start webcam session
✅ Faces recognized with >50% confidence
✅ Attendance auto-marked
✅ Emotion labels displayed
✅ Mobile attendance works with GPS
