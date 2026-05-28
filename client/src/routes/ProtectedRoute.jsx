import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Now uses AuthContext instead of reading localStorage directly.
// This is more reliable — if logout() clears the context,
// this route immediately reacts and redirects.

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
