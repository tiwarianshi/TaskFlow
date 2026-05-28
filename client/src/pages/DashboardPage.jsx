// src/pages/DashboardPage.jsx

import useAuth from "../hooks/useAuth";

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to Dashboard
      </h1>

      <p className="text-gray-400 mb-6">
        Logged in as: {user?.email}
      </p>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}

export default DashboardPage;