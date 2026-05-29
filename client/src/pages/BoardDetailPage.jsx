// src/pages/BoardDetailPage.jsx
// The main Kanban board view for a single board.
// Fetches board metadata + all tasks, groups tasks by status, renders columns.

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate }        from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";


// Existing layout shell — DO NOT recreate these
import Sidebar from "../components/dashboard/Sidebar";
import Topbar  from "../components/dashboard/Topbar";

// Task-specific components
import TaskColumn from "../components/task/TaskColumn";

// API functions
import { getBoardById, getTasksByBoard } from "../api/taskApi";

// ─── Board accent colors (mirrors BoardCard.jsx) ──────────────────────────────
const BOARD_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500   to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500  to-orange-600",
  "from-sky-500    to-cyan-600",
  "from-purple-500 to-fuchsia-600",
];

// The three canonical Kanban statuses — ORDER matters for column rendering
const STATUSES = ["todo", "inprogress", "done"];

export default function BoardDetailPage() {
  const { boardId }   = useParams();   // from /board/:boardId
  const navigate      = useNavigate();

  // ─── State ────────────────────────────────────────────────────────────────
  const [board,       setBoard]       = useState(null);
  const [tasks,       setTasks]       = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Fetch board + tasks on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!boardId) return;
    fetchBoardData();
  }, [boardId]);

  async function fetchBoardData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fire both requests in parallel — faster than sequential
      const [boardData, tasksData] = await Promise.all([
        getBoardById(boardId),
        getTasksByBoard(boardId),
      ]);

      setBoard(boardData);
      setTasks(tasksData);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load board.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Group tasks by status ────────────────────────────────────────────────
  // useMemo so grouping only recalculates when tasks array changes
  const tasksByStatus = useMemo(() => {
    const groups = { todo: [], "inprogress": [], done: [] };
    tasks.forEach((task) => {
      // Guard: ignore tasks with unknown status
      if (groups[task.status] !== undefined) {
        groups[task.status].push(task);
      }
    });
    return groups;
  }, [tasks]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const gradient   = BOARD_GRADIENTS[board?.color ?? 0];
  const totalTasks = tasks.length;
  const doneTasks  = tasksByStatus.done.length;
  const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ─── Render helpers ───────────────────────────────────────────────────────

  // Full-area loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
              <p className="text-gray-500 text-sm">Loading board...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20
                              flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Couldn't load board</h3>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/boards")}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white
                             hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Back to boards
                </button>
                <button
                  onClick={fetchBoardData}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500
                             text-white rounded-lg transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* ── Board header ── */}
        <div className="flex-shrink-0 border-b border-gray-800/80 bg-gray-950">

          {/* Colored accent bar matching the board's color */}
          <div className={`h-[3px] w-full bg-gradient-to-r ${gradient}`} />

          <div className="px-4 sm:px-6 py-4">
            {/* Back link + board title row */}
            <div className="flex items-start gap-3">
              {/* Back button */}
              <button
                onClick={() => navigate("/boards")}
                className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg text-gray-500
                           hover:text-gray-300 hover:bg-gray-800
                           transition-colors duration-150"
                title="Back to boards"
              >
                <ArrowLeft size={16} />
              </button>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Board color icon */}
                  <div className={`w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br ${gradient}
                                   flex items-center justify-center`}>
                    <LayoutDashboard size={14} className="text-white" />
                  </div>

                  <h1 className="text-lg font-bold text-white truncate">
                    {board?.title}
                  </h1>

                  {/* Task count pill */}
                  <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700
                                   px-2.5 py-0.5 rounded-full flex-shrink-0">
                    {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Optional description */}
                {board?.description && (
                  <p className="text-gray-500 text-xs mt-1 ml-11 truncate">
                    {board.description}
                  </p>
                )}

                {/* Progress bar */}
                {totalTasks > 0 && (
                  <div className="flex items-center gap-3 mt-2.5 ml-11">
                    <div className="flex-1 max-w-[200px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full
                                    transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 flex-shrink-0">
                      {progress}% complete
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Kanban columns ── */}
        {/*
          overflow-x-auto  → horizontal scroll when columns overflow viewport
          flex gap-4       → columns sit side by side
          pb-6             → space at bottom so box-shadows aren't clipped
        */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 h-full px-4 sm:px-6 py-5 min-w-max">
              {STATUSES.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  // onCardClick can be wired to a detail modal in a future step
                  onCardClick={(task) => console.log("Task clicked:", task._id)}
                />
              ))}

              {/* Right padding spacer so last column isn't flush against edge */}
              <div className="w-2 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
