import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatsCard from "../components/dashboard/StatsCard";
import ActivityItem from "../components/activity/ActivityItem";
import { getBoardsWithStats, getBoardStats, getDashboardActivity } from "../api/boardApi";

const ICONS = {
  boards: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  tasks: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  pending: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  completion: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ─── DashboardPage ─────────────────────────────────────────────────────────────
function DashboardPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get first name only for a friendlier greeting
  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        let data = await getBoardsWithStats();

        if (data.length && data[0].stats === undefined) {
          const statsResults = await Promise.all(
            data.map(async (board) => {
              try {
                return { boardId: board._id, stats: await getBoardStats(board._id) };
              } catch {
                return { boardId: board._id, stats: { total: 0, completed: 0 } };
              }
            })
          );

          const statsMap = Object.fromEntries(
            statsResults.map((item) => [item.boardId, item.stats])
          );

          data = data.map((board) => ({
            ...board,
            stats: statsMap[board._id] || { total: 0, completed: 0 },
          }));
        }

        if (!cancelled) {
          setBoards(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load dashboard analytics");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false

    async function loadActivity() {
      setActivityLoading(true)
      setActivityError(null)

      try {
        const data = await getDashboardActivity()
        if (!cancelled) {
          setActivity(data)
        }
      } catch (err) {
        if (!cancelled) {
          setActivityError(err?.response?.data?.message || 'Failed to load activity')
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false)
        }
      }
    }

    loadActivity()

    return () => {
      cancelled = true
    }
  }, [])

  const analytics = useMemo(() => {
    const totalBoards = boards.length;
    const totalTasks = boards.reduce((sum, board) => sum + (board.stats?.total || 0), 0);
    const completed = boards.reduce((sum, board) => sum + (board.stats?.completed || 0), 0);
    const pending = Math.max(totalTasks - completed, 0);
    const completionRate = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;

    return {
      totalBoards,
      totalTasks,
      completed,
      pending,
      completionRate,
    };
  }, [boards]);

  const overviewCards = [
    {
      title: "Total Boards",
      value: analytics.totalBoards,
      color: "bg-indigo-500/20",
      iconColor: "text-indigo-400",
      icon: ICONS.boards,
    },
    {
      title: "Total Tasks",
      value: analytics.totalTasks,
      color: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      icon: ICONS.tasks,
    },
    {
      title: "Pending Tasks",
      value: analytics.pending,
      color: "bg-amber-500/20",
      iconColor: "text-amber-400",
      icon: ICONS.pending,
    },
    {
      title: "Completion",
      value: `${analytics.completionRate}%`,
      color: "bg-sky-500/20",
      iconColor: "text-sky-400",
      icon: ICONS.completion,
    },
  ];

  const recentBoards = useMemo(
    () =>
      [...boards]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        )
        .slice(0, 3),
    [boards]
  );

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
            {error ? (
              <div className="rounded-2xl border border-red-600/20 bg-red-950/40 p-5 text-sm text-red-300">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewCards.map((stat) => (
                  <StatsCard
                    key={stat.title}
                    title={stat.title}
                    value={loading ? "—" : stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    iconColor={stat.iconColor}
                  />
                ))}
              </div>
            )}
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
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-xl border border-gray-800 bg-gray-900/70 animate-pulse"
                  />
                ))
              ) : recentBoards.length > 0 ? (
                recentBoards.map((board) => (
                  <Link
                    key={board._id}
                    to={`/board/${board._id}`}
                    className="group bg-gray-900 border border-gray-800 rounded-xl p-5
                               hover:border-gray-700 transition-colors duration-150"
                  >
                    <div className={`w-10 h-1.5 rounded-full ${board.color || 'bg-indigo-500'} mb-4`} />
                    <h4 className="text-white font-semibold text-sm group-hover:text-indigo-400 transition">
                      {board.title}
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      {board.stats?.total ?? 0} tasks
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
                  <p className="text-sm text-gray-400">No recent boards yet.</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Create a board and it will show up here once you open it.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Recent Activity
            </h3>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              {activityError ? (
                <div className="rounded-2xl border border-red-600/20 bg-red-950/40 p-5 text-sm text-red-300">
                  {activityError}
                </div>
              ) : activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 rounded-2xl bg-zinc-800/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-gray-900 p-8 text-center">
                  <p className="text-sm text-gray-400">No recent activity</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Create a board or add a task to start generating activity.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {activity.map((item, index) => (
                    <ActivityItem
                      key={item._id || index}
                      activity={item}
                      isLast={index === activity.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
