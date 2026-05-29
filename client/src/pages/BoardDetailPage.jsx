// src/pages/BoardDetailPage.jsx

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

import TaskColumn from "../components/task/TaskColumn";
import TaskModal from "../components/task/TaskModal";

import {
  getBoardById,
  getTasksByBoard,
} from "../api/taskApi";

const BOARD_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-cyan-600",
  "from-purple-500 to-fuchsia-600",
];

const STATUSES = ["todo", "inprogress", "done"];

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  // ─────────────────────────────────────────
  // Main State
  // ─────────────────────────────────────────

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─────────────────────────────────────────
  // Modal State
  // ─────────────────────────────────────────

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  // ─────────────────────────────────────────
  // Fetch Board + Tasks
  // ─────────────────────────────────────────

  useEffect(() => {
    if (!boardId) return;
    fetchBoardData();
  }, [boardId]);

  async function fetchBoardData() {
    try {
      setIsLoading(true);
      setError(null);

      const [boardData, tasksData] = await Promise.all([
        getBoardById(boardId),
        getTasksByBoard(boardId),
      ]);

      setBoard(boardData);
      setTasks(tasksData);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to load board.";

      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  // ─────────────────────────────────────────
  // CRUD Handlers
  // ─────────────────────────────────────────

  function handleCreateTask(status = "todo") {
    setSelectedTask(null);
    setDefaultStatus(status);
    setIsTaskModalOpen(true);
  }

  function handleEditTask(task) {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }

  function handleTaskCreated(newTask) {
    setTasks((prev) => [...prev, newTask]);
  }

  function handleTaskUpdated(updatedTask) {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === updatedTask._id
          ? updatedTask
          : task
      )
    );
  }

  function handleTaskDeleted(taskId) {
    setTasks((prev) =>
      prev.filter((task) => task._id !== taskId)
    );
  }

  // ─────────────────────────────────────────
  // Group Tasks By Status
  // ─────────────────────────────────────────

  const tasksByStatus = useMemo(() => {
    const groups = {
      todo: [],
      inprogress: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (groups[task.status] !== undefined) {
        groups[task.status].push(task);
      }
    });

    return groups;
  }, [tasks]);

  // ─────────────────────────────────────────
  // Derived Values
  // ─────────────────────────────────────────

  const gradient =
    BOARD_GRADIENTS[board?.color ?? 0];

  const totalTasks = tasks.length;
  const doneTasks = tasksByStatus.done.length;

  const progress =
    totalTasks > 0
      ? Math.round((doneTasks / totalTasks) * 100)
      : 0;

  // ─────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2
                size={32}
                className="animate-spin text-indigo-400"
              />

              <p className="text-gray-500 text-sm">
                Loading board...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Error State
  // ─────────────────────────────────────────

  if (error) {
    return (
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle
                  size={24}
                  className="text-red-400"
                />
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1">
                  Couldn't load board
                </h3>

                <p className="text-gray-500 text-sm">
                  {error}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/boards")}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Back to boards
                </button>

                <button
                  onClick={fetchBoardData}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
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

  // ─────────────────────────────────────────
  // Main UI
  // ─────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-800/80 bg-gray-950">

          <div
            className={`h-[3px] w-full bg-gradient-to-r ${gradient}`}
          />

          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">

              <button
                onClick={() => navigate("/boards")}
                className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors duration-150"
              >
                <ArrowLeft size={16} />
              </button>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-3 flex-wrap">

                  <div
                    className={`w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  >
                    <LayoutDashboard
                      size={14}
                      className="text-white"
                    />
                  </div>

                  <h1 className="text-lg font-bold text-white truncate">
                    {board?.title}
                  </h1>

                  <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2.5 py-0.5 rounded-full flex-shrink-0">
                    {totalTasks} task
                    {totalTasks !== 1 ? "s" : ""}
                  </span>
                </div>

                {board?.description && (
                  <p className="text-gray-500 text-xs mt-1 ml-11 truncate">
                    {board.description}
                  </p>
                )}

                {totalTasks > 0 && (
                  <div className="flex items-center gap-3 mt-2.5 ml-11">

                    <div className="flex-1 max-w-[200px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                        style={{
                          width: `${progress}%`,
                        }}
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

        {/* Columns */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto overflow-y-hidden">

            <div className="flex gap-4 h-full px-4 sm:px-6 py-5 min-w-max">

              {STATUSES.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  onAddTask={() =>
                    handleCreateTask(status)
                  }
                  onCardClick={handleEditTask}
                />
              ))}

              <div className="w-2 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        boardId={boardId}
        defaultStatus={defaultStatus}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
}