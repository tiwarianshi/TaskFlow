import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";

import toast from "react-hot-toast";

import { ArrowLeft, LayoutDashboard } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

import TaskColumn from "../components/task/TaskColumn";
import TaskCard from "../components/task/TaskCard";
import TaskModal from "../components/task/TaskModal";

import { getBoardById } from "../api/boardApi";
import { getTasksByBoard, updateTask } from "../api/taskApi";

// ─── Board gradient colors ───────────────────────────────────────────────────
const BOARD_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-cyan-600",
  "from-purple-500 to-fuchsia-600",
];

// ─── Kanban statuses ─────────────────────────────────────────────────────────
const STATUSES = ["todo", "inprogress", "done"];

// ─── Drag overlay animation ──────────────────────────────────────────────────
const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  // ─── State ────────────────────────────────────────────────────────────────
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active dragged task
  const [activeTask, setActiveTask] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  // Snapshot before drag (used for rollback)
  const tasksBeforeDrag = useRef(null);

  // ─── Fetch board + tasks ──────────────────────────────────────────────────
  const fetchBoardData = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;
    fetchBoardData();
  }, [boardId, fetchBoardData]);

  // ─── Group tasks by status ────────────────────────────────────────────────
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      inprogress: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped.todo.push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // ─── Progress calculation ─────────────────────────────────────────────────
  const progress = useMemo(() => {
    if (!tasks.length) return 0;

    return Math.round(
      (tasksByStatus.done.length / tasks.length) * 100
    );
  }, [tasks, tasksByStatus]);

  // ─── Sensors ──────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // ─── Drag start ───────────────────────────────────────────────────────────
  function handleDragStart({ active }) {
    const task = tasks.find((t) => t._id === active.id);

    setActiveTask(task || null);

    // snapshot before optimistic update
    tasksBeforeDrag.current = tasks;
  }

  // ─── Drag over ────────────────────────────────────────────────────────────
  function handleDragOver({ active, over }) {
    if (!over) return;

    const activeTaskId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t._id === activeTaskId);

    if (!activeTask) return;

    let overStatus;

    // hovering over column
    if (STATUSES.includes(overId)) {
      overStatus = overId;
    } else {
      // hovering over another task
      const overTask = tasks.find((t) => t._id === overId);

      if (!overTask) return;

      overStatus = overTask.status;
    }

    // no change needed
    if (activeTask.status === overStatus) return;

    // optimistic UI update
    setTasks((prev) =>
      prev.map((task) =>
        task._id === activeTaskId
          ? { ...task, status: overStatus }
          : task
      )
    );
  }

  // ─── Drag end ─────────────────────────────────────────────────────────────
  async function handleDragEnd({ active, over }) {
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id;
    const overId = over.id;

    const currentTask = tasks.find((t) => t._id === activeTaskId);

    if (!currentTask) return;

    let finalStatus;

    if (STATUSES.includes(overId)) {
      finalStatus = overId;
    } else {
      const overTask = tasks.find((t) => t._id === overId);

      finalStatus = overTask?.status || currentTask.status;
    }

    const previousStatus =
      tasksBeforeDrag.current?.find(
        (t) => t._id === activeTaskId
      )?.status;

    // persist only if changed
    if (
      previousStatus &&
      previousStatus !== finalStatus
    ) {
      try {
        await updateTask(activeTaskId, {
          status: finalStatus,
        });
      } catch (err) {
        // rollback
        setTasks(tasksBeforeDrag.current);

        toast.error(
          err.response?.data?.message ||
            "Failed to update task status."
        );
      }
    }

    tasksBeforeDrag.current = null;
  }

  // ─── Drag cancel ──────────────────────────────────────────────────────────
  function handleDragCancel() {
    if (tasksBeforeDrag.current) {
      setTasks(tasksBeforeDrag.current);
    }

    setActiveTask(null);
    tasksBeforeDrag.current = null;
  }

  // ─── Modal handlers ───────────────────────────────────────────────────────
  function handleAddTask(status) {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setDefaultStatus(task.status);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingTask(null);
  }

  function handleTaskSaved(savedTask) {
    setTasks((prev) => {
      const exists = prev.find(
        (t) => t._id === savedTask._id
      );

      if (exists) {
        return prev.map((t) =>
          t._id === savedTask._id ? savedTask : t
        );
      }

      return [...prev, savedTask];
    });

    handleModalClose();
  }

  function handleTaskDeleted(taskId) {
    setTasks((prev) =>
      prev.filter((t) => t._id !== taskId)
    );

    handleModalClose();
  }

  // ─── Derived UI values ────────────────────────────────────────────────────
  const gradient =
    BOARD_GRADIENTS[board?.color ?? 0];

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />

              <p className="text-sm text-gray-500">
                Loading board...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <p className="text-red-400 mb-4">
                {error}
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/boards")}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>

                <button
                  onClick={fetchBoardData}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                >
                  Retry
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
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-gray-800 bg-gray-950">
          <div
            className={`h-[3px] bg-gradient-to-r ${gradient}`}
          />

          <div className="px-4 sm:px-6 py-4">
            <button
              onClick={() => navigate("/boards")}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4"
            >
              <ArrowLeft size={13} />
              Back to boards
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient}
                           flex items-center justify-center flex-shrink-0`}
              >
                <LayoutDashboard
                  size={16}
                  className="text-white"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white truncate">
                  {board?.title}
                </h1>

                {board?.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {board.description}
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">
                  {tasksByStatus.done.length}/{tasks.length} done
                </span>

                <div className="w-28 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${gradient}
                               transition-all duration-500`}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Board columns ── */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="flex gap-4 h-full px-4 sm:px-6 py-5 min-w-max">
                {STATUSES.map((status) => (
                  <TaskColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    activeId={activeTask?._id}
                  />
                ))}

                <div className="w-2 flex-shrink-0" />
              </div>

              {/* ── Drag overlay ── */}
              <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                  <TaskCard
                    task={activeTask}
                    isOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      {/* ── Task modal ── */}
      {modalOpen && (
        <TaskModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          task={editingTask}
          boardId={boardId}
          defaultStatus={defaultStatus}
          onTaskCreated={handleTaskSaved}
          onTaskUpdated={handleTaskSaved}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}