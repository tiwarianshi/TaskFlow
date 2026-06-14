import { NavLink, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

// ─── Icons as tiny inline SVG components ──────────────────────────────────────
// Keeping icons inline avoids adding a whole icon library dependency.
// Each returns a simple <svg> element — easy to swap later if needed.

function IconDashboard() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function IconBoards() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// ─── NavLink style helper ──────────────────────────────────────────────────────
// NavLink from React Router gives us an `isActive` boolean automatically.
// We use it to highlight the current page's link.
function navLinkClass({ isActive }) {
  const base =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150";
  return isActive
    ? `${base} bg-indigo-600 text-white`               // active: solid indigo
    : `${base} text-gray-400 hover:bg-gray-800 hover:text-white`; // inactive: subtle hover
}

// ─── Sidebar Component ────────────────────────────────────────────────────────
// On desktop: fixed left column, always visible
// On mobile: hidden by default — Topbar will toggle it (future step)
// Props:
//   onClose — called when a nav link is clicked on mobile to close the sidebar

function Sidebar({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();                                  // clears context + localStorage
    toast.success("Logged out successfully");  // feedback before redirect
    navigate("/login");
  }

  return (
    // Outer wrapper: full height, dark background, fixed width
    <aside className="flex flex-col h-full w-64 bg-gray-900 border-r border-gray-800">

      {/* ── Logo / Brand ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
      </div>

      {/* ── Navigation Links ──────────────────────────────────────────── */}
      {/* flex-1 pushes the logout button to the bottom */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

        <NavLink to="/dashboard" className={navLinkClass} onClick={onClose}>
          <IconDashboard />
          Dashboard
        </NavLink>

        <NavLink to="/boards" className={navLinkClass} onClick={onClose}>
          <IconBoards />
          Boards
        </NavLink>

        <NavLink to="/calendar" className={navLinkClass} onClick={onClose}>
          <Calendar className="w-5 h-5" />
          Calendar
        </NavLink>

        <NavLink to="/settings" className={navLinkClass} onClick={onClose}>
          <IconSettings />
          Settings
        </NavLink>

      </nav>

      {/* ── Logout Button ─────────────────────────────────────────────── */}
      {/* Pinned to the bottom with a top border separator */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-400 hover:bg-red-500/10 hover:text-red-400
                     transition-colors duration-150"
        >
          <IconLogout />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
