import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// A clean custom hook so you never have to import both
// useContext AND AuthContext in every component.
//
// Usage in any component:
//   const { user, login, logout, isAuthenticated } = useAuth();

function useAuth() {
  const context = useContext(AuthContext);

  // If useAuth() is called outside of <AuthProvider>, warn the developer
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>. Check your main.jsx.");
  }

  return context;
}

export default useAuth;
