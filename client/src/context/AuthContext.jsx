import { createContext, useState } from "react";

// ─── Step 1: Create the context ───────────────────────────────────────────────
// Think of this as an "empty box" we'll fill with user data.
// Other components import AuthContext to read from this box.
export const AuthContext = createContext(null);

// ─── Step 2: Create the Provider ──────────────────────────────────────────────
// The Provider wraps your whole app (in main.jsx) and makes
// user + token available to every component inside it.
export function AuthProvider({ children }) {

  // Load initial state from localStorage so login persists on page refresh.
  // The function inside useState() only runs once on first render — not on every re-render.
  const [user, setUser] = useState(() => {
    try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ── login() ────────────────────────────────────────────────────────────────
  // Call this after a successful API response from /api/auth/login or /register.
  // Pass in the user object and JWT token string from the API.
  function login(userData, tokenString) {
    setUser(userData);
    setToken(tokenString);
    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("token", tokenString);
  }

  // ── logout() ───────────────────────────────────────────────────────────────
  // Clears everything — state and localStorage.
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  function updateUser(userData) {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  // ── isAuthenticated ────────────────────────────────────────────────────────
  // A handy boolean: true when a token exists.
  // Use this anywhere instead of writing `token !== null` every time.
  const isAuthenticated = !!token;

  // Everything we share with the rest of the app
  const value = {
    user,            // { _id, name, email, ... }
    token,           // "eyJhbGci..."
    isAuthenticated, // true / false
    login,           // login(userData, tokenString)
    logout,          // logout()
    updateUser,      // updateUser(userData)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
