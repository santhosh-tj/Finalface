import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import { CreateSessionPage } from "./pages/faculty/CreateSessionPage";
import { LiveAttendancePage } from "./pages/faculty/LiveAttendancePage";
import { ManageFacultyPage } from "./pages/admin/ManageFacultyPage";
import { ManageStudentsPage } from "./pages/admin/ManageStudentsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { FacultyReportsPage } from "./pages/faculty/FacultyReportsPage";
import { RegisterFacePage } from "./pages/student/RegisterFacePage";
import { AttendanceHistoryPage } from "./pages/student/AttendanceHistoryPage";
import { MobileAttendancePage } from "./pages/student/MobileAttendancePage";

import { GlobalLoader } from "./components/common/GlobalLoader";

function App() {
  const { loading, user, globalLoading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalLoader isLoading={globalLoading} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* ... routes ... */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageFacultyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/session"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <CreateSessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/live/:sessionId"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <LiveAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/reports"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/register-face"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RegisterFacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AttendanceHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/mobile-attendance"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MobileAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "faculty"
                    ? "/faculty"
                    : "/student"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;


