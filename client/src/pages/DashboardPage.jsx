import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCard from "../components/dashboard/StatsCard";

// ─── Static placeholder data ───────────────────────────────────────────────────
// These will later be replaced by real API calls (e.g. GET /api/boards, GET /api/tasks)
// For now they let us build and style the UI without a live backend.

const STATS = [
  {
    title: "Total Boards",
    value: 4,
    color: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    title: "Total Tasks",
    value: 24,
    color: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "In Progress",
    value: 8,
    color: "bg-amber-500/20",
    iconColor: "text-amber-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Completed",
    value: 12,
    color: "bg-sky-500/20",
    iconColor: "text-sky-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const RECENT_BOARDS = [
  { _id: "1", title: "Website Redesign",    taskCount: 8,  color: "bg-indigo-500" },
  { _id: "2", title: "Mobile App Launch",   taskCount: 5,  color: "bg-emerald-500" },
  { _id: "3", title: "Marketing Campaign",  taskCount: 11, color: "bg-amber-500" },
];

// ─── DashboardPage ─────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user } = useAuth();

  // Controls the mobile sidebar overlay (open/closed)
  // On desktop the sidebar is always visible — this only matters on small screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get first name only for a friendlier greeting
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    // Full screen dark background
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────────
          Shown when sidebarOpen is true on mobile.
          Clicking the dark backdrop closes it.                         */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Dark semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel slides in from the left */}
          <div className="absolute left-0 top-0 h-full z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────
          Hidden on mobile (hidden md:flex), always visible on md+      */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────
          Takes all remaining width (flex-1)                            */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar — passes page title and mobile menu handler */}
        <Topbar
          title="Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ── PAGE BODY ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* Welcome message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">
              Good to see you, {firstName} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* ── STATS CARDS GRID ────────────────────────────────────────
              grid-cols-1 on mobile → 2 on sm → 4 on lg                */}
          <section className="mb-10">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <StatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  iconColor={stat.iconColor}
                />
              ))}
            </div>
          </section>

          {/* ── RECENT BOARDS ───────────────────────────────────────────── */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Boards
              </h3>
              <Link
                to="/boards"
                className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RECENT_BOARDS.map((board) => (
                <Link
                  key={board._id}
                  to={`/board/${board._id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl p-5
                             hover:border-gray-700 transition-colors duration-150"
                >
                  {/* Colored top stripe */}
                  <div className={`w-10 h-1.5 rounded-full ${board.color} mb-4`} />

                  <h4 className="text-white font-semibold text-sm group-hover:text-indigo-400 transition">
                    {board.title}
                  </h4>
                  <p className="text-gray-500 text-xs mt-1">
                    {board.taskCount} tasks
                  </p>
                </Link>
              ))}

              {/* Create new board card */}
              <button
                className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-5
                           flex flex-col items-center justify-center gap-2
                           hover:border-indigo-600 hover:bg-gray-800/50
                           transition-colors duration-150 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-gray-500 text-xs font-medium">New Board</span>
              </button>
            </div>
          </section>

          {/* ── EMPTY STATE placeholder ───────────────────────────────────
              Shown when the user has no tasks yet (swap this out later) */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Recent Activity
            </h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10
                            flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium text-sm">No recent activity</p>
              <p className="text-gray-600 text-xs mt-1">
                Create a board and start adding tasks to see your activity here.
              </p>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
