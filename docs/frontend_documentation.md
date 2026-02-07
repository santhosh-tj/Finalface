# Frontend Documentation

## Directory Structure

```
frontend/src/
├── components/
│   ├── admin/       # Admin-specific UI (Widgets, Tables)
│   ├── auth/        # Login forms
│   ├── common/      # Reusable UI (Buttons, Inputs, Cards)
│   ├── layout/      # Sidebar, Header
│   ├── three/       # 3D visuals
│   └── webcam/      # Camera handling logic
├── contexts/        # React Context (Auth, Theme)
├── hooks/           # Custom Hooks
├── pages/
│   ├── admin/       # Admin views + local components
│   ├── auth/        # Login page
│   ├── faculty/     # Faculty views
│   └── student/     # Student views
├── services/        # API integration (Axios)
└── App.jsx          # Main routing & layout
```

## Key Components

### Webcam Feed (`components/webcam/WebcamFeed.jsx`)
-   **Purpose**: Handles raw video stream from user's camera.
-   **Logic**: Uses `navigator.mediaDevices.getUserMedia` to stream video to a `<video>` element.

### Face Overlay (`components/webcam/FaceOverlay.jsx`)
-   **Purpose**: Draws bounding boxes around detected faces.
-   **Props**: `faces` array containing coordinates and labels.
-   **Styling**: Uses absolute positioning over the video feed.

### Protected Route (`routes/ProtectedRoute.jsx`)
-   **Purpose**: Resticts access based on user role.
-   **Logic**: Checks `AuthContext` for a valid token and matching role. Redirects to `/login` if unauthorized.

## State Management

### AuthContext (`contexts/AuthContext.jsx`)
-   **Props**: `user`, `login`, `logout`.
-   **Storage**: Persists JWT token in `localStorage`.
-   **Logic**: Decodes JWT to extract user role and details.

### ThemeContext (`contexts/ThemeContext.jsx`)
-   **Props**: `theme`, `toggleTheme`.
-   **Storage**: Persists 'light' or 'dark' preference in `localStorage`.
-   **Effect**: Applied `dark` class to `<html>` element.

## Styling & Animations

-   **Tailwind CSS**: Utility-first styling for layout and design system.
-   **Framer Motion**: Used for page transitions, modal popups, and smooth UI interactions.
-   **Glassmorphism**: Heavy use of `backdrop-blur` and semi-transparent backgrounds for a modern aesthetic.
