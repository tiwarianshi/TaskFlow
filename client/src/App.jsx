// App.jsx — updated with /boards route added

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import DashboardPage   from "./pages/DashboardPage";
import BoardsPage      from "./pages/BoardsPage";       // ← NEW
import BoardDetailPage from "./pages/BoardDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — redirect to /login if no token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"            element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/boards"      element={<BoardsPage />} />          {/* ← NEW */}
            <Route path="/board/:boardId" element={<BoardDetailPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
