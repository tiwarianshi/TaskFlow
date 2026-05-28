import { useState } from "react";
import useAuth from "../../hooks/useAuth";

// ─── Topbar / Navbar ──────────────────────────────────────────────────────────
// Shown at the top of every dashboard page.
// On desktop: shows the page title and user avatar.
// On mobile: also shows a hamburger menu button to open the sidebar.
//
// Props:
//   title      — the current page name shown in the topbar (e.g. "Dashboard")
//   onMenuClick — called when the hamburger button is pressed on mobile

function Topbar({ title = "Dashboard", onMenuClick }) {
  const { user } = useAuth();

  // Get the first letter of the user's name for the avatar circle.
  // If no name exists yet, fall back to "U" for User.
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="flex items-center justify-between
                        px-4 sm:px-6 py-4
                        bg-gray-900 border-b border-gray-800
                        sticky top-0 z-10">

      {/* ── Left side: hamburger (mobile only) + page title ───────────── */}
      <div className="flex items-center gap-3">

        {/* Hamburger — only visible on mobile (md:hidden) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <h1 className="text-white font-semibold text-lg">{title}</h1>
      </div>

      {/* ── Right side: user info + avatar ────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* User name — hidden on very small screens */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-white leading-tight">{user?.name || "User"}</p>
          <p className="text-xs text-gray-400 leading-tight">{user?.email || ""}</p>
        </div>

        {/* Avatar circle — first letter of name on indigo background */}
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center
                        text-white font-semibold text-sm flex-shrink-0 select-none">
          {avatarLetter}
        </div>

      </div>
    </header>
  );
}

export default Topbar;
