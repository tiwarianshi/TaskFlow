import axios from "axios";

// ─── Create a custom axios instance ───────────────────────────────────────────
// Instead of writing the full URL in every API call, we configure it once here.
// Every file that imports `api` gets these defaults automatically.

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // import.meta.env is how Vite exposes .env variables (NOT process.env)
  // VITE_API_URL must start with "VITE_" or Vite will ignore it
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// This runs automatically BEFORE every request is sent.
// It reads the token from localStorage and attaches it to the Authorization header.
// You never have to manually add headers in any other file.

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Your backend reads: req.headers.authorization → "Bearer eyJhbGci..."
    }

    return config; // Always return config — this sends the request
  },
  (error) => {
    // If something goes wrong building the request (rare), reject it
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// This runs automatically AFTER every response comes back.
// The 401 check below handles expired/invalid tokens globally —
// no need to check for 401 in every individual API call.

api.interceptors.response.use(
  (response) => {
    // Request succeeded — just pass the response through unchanged
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      // Note: we use window.location here (not useNavigate) because
      // this file is outside React — it has no access to React hooks
    }

    return Promise.reject(error);
  }
);

export default api;
