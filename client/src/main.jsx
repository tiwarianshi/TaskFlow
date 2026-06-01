import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./socket/SocketProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>

      {/*
        <Toaster> lives here — outside App, inside AuthProvider.
        This means toasts work on EVERY page in the app.
        You never need to add it to individual pages.
      */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,

          // Default style for all toasts
          style: {
            background: "#1f2937",  // gray-800 — matches our dark theme
            color: "#f9fafb",       // gray-50
            border: "1px solid #374151", // gray-700
            fontSize: "14px",
            borderRadius: "10px",
          },

          // ✅ Success toasts — green accent
          success: {
            iconTheme: {
              primary: "#6366f1",   // indigo-500
              secondary: "#fff",
            },
          },

          // ❌ Error toasts — red accent
          error: {
            iconTheme: {
              primary: "#ef4444",   // red-500
              secondary: "#fff",
            },
          },
        }}
      />

      <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
