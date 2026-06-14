// src/App.jsx — updated with /board/:boardId route

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import ProtectedRoute      from "./routes/ProtectedRoute";

import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
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

          {/* ── Protected routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"                  element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/boards"            element={<BoardsPage />} />
            <Route path="/calendar"          element={<CalendarPage />} />
            <Route path="/board/:boardId"    element={<BoardDetailPage />} />  {/* ← NEW */}
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
