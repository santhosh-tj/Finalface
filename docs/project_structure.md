# Frontend Project Structure

This document provides a detailed overview of the frontend directory structure for the Face Attendance System.

## Root Directory (`frontend/src`)

-   **`App.jsx`**: The main application component. Handles top-level routing and layout structure.
-   **`main.jsx`**: Enty point for the React application.
-   **`index.css`**: Global styles and Tailwind imports.

## Components (`frontend/src/components`)

Reusable UI components organized by domain.

### `analytics/` (Modularized)
Chart components used in `SystemAnalyticsPage`.
-   `SystemTrafficChart.jsx`: Line chart for system traffic.
-   `AttendanceModesChart.jsx`: Doughnut chart for attendance modes.
-   `DepartmentAttendanceChart.jsx`: Bar chart for department statistics.

### `auth/`
Authentication related components.
-   `LoginForm.jsx`: The login form component.

### `common/`
Generic, reusable UI elements.
-   `Button.jsx`: Standard styled button.
-   `Card.jsx`: Container component with standard web styling.
-   `GlobalLoader.jsx`: Loading spinner overlay.
-   `HolographicCard.jsx`: Specialized card with holographic effects.
-   `Input.jsx`: Standard styled input field.
-   `ThemeToggle.jsx`: Component to toggle light/dark mode.

### `layout/`
Main layout components.
-   `Sidebar.jsx`: Navigation sidebar.
-   `Header.jsx`: Top header bar.
-   `FacultyBackground.jsx`: Specialized background for faculty pages.
-   `StudentBackground3D.jsx`: 3D background for student pages.

### `login/`
Components specific to the 3D Login Scene.
-   `LoginScene3D.jsx`, `WhiteModeScene.jsx`: 3D scenes for login.
-   `PhoneModel.jsx`, `PhoneScreen.jsx`: 3D phone assets.
-   `CCTVCamera.jsx`, `ClassroomEnvironment.jsx`: 3D environment assets.

### `three/`
General 3D components.
-   `AdminBackground3D.jsx`: Background for admin pages.
-   `ParticleField.jsx`: Particle effects.

### `webcam/`
Components for camera handling and face recognition.
-   `WebcamFeed.jsx`, `AntigravityFeed.jsx`: Camera feed components.
-   `FaceOverlay.jsx`: Overlay for face detection boxes.
-   `WebcamHUD.jsx`: Heads-up display for camera view.
-   `LiveCount.jsx`: Live attendance counter.

### `FaceCaptureComponent.jsx`
Standalone component for face registration capture flow.

## Pages (`frontend/src/pages`)

Application views, organized by user role.

### `admin/`
Pages accessible to Administrators.
-   **`components/`**: Admin-specific components colocated here.
    -   `ActivityLog.jsx`, `AnimatedStatCard.jsx`, `BulkImportModal.jsx`
    -   `DashboardCharts.jsx`, `DataTable.jsx`, `NotificationCenter.jsx`
-   `AdminDashboard.jsx`: Main admin overview.
-   `AdminReportsPage.jsx`: Detailed reports view.
-   `ManageFacultyPage.jsx`, `ManageStudentsPage.jsx`: User management.
-   `SettingsPage.jsx`: System settings.
-   `SystemAnalyticsPage.jsx`: detailed system analytics.

### `faculty/`
Pages accessible to Faculty.
-   `FacultyDashboard.jsx`: Main faculty overview.
-   `CreateSessionPage.jsx`: Interface to start new classes.
-   `LiveAttendancePage.jsx`: Real-time attendance monitoring.
-   `FacultyReportsPage.jsx`: Reports for faculty members.

### `student/`
Pages accessible to Students.
-   `StudentDashboard.jsx`: Main student overview.
-   `RegisterFacePage.jsx`: Face registration flow.
-   `AttendanceHistoryPage.jsx`: Student's personal attendance log.
-   `MobileAttendancePage.jsx`: Mobile-optimzied attendance view.

### `auth/`
-   `LoginPage.jsx`: Entry point for authentication.

## Other Directories
-   **`api/`**: Axios instances for API communication.
-   **`config/`**: Configuration files (e.g., `colors.js`).
-   **`contexts/`**: React Context providers (Auth, Theme).
-   **`hooks/`**: Custom hooks (`useWebcam`, `useGeolocation`, etc.).
-   **`routes/`**: Route protection logic (`ProtectedRoute.jsx`).
