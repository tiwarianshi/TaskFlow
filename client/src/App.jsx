// src/App.jsx — updated with /board/:boardId route

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import ProtectedRoute      from "./routes/ProtectedRoute";
import SettingsPage from "./pages/SettingsPage";

import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
import ForgotPasswordPage  from "./pages/ForgotPasswordPage";
import ResetPasswordPage   from "./pages/ResetPasswordPage";
import DashboardPage       from "./pages/DashboardPage";
import BoardsPage          from "./pages/BoardsPage";
import CalendarPage        from "./pages/CalendarPage";
import BoardDetailPage     from "./pages/BoardDetailPage";   // ← uses /board/:boardId

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* ── Protected routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"                  element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/boards"            element={<BoardsPage />} />
            <Route path="/calendar"          element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/board/:boardId"    element={<BoardDetailPage />} />  {/* ← NEW */}
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
