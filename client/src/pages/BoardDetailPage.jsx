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
import { arrayMove } from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { ArrowLeft, KanbanSquare } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import TaskColumn from "../components/task/TaskColumn";
import TaskCard from "../components/task/TaskCard";
import TaskModal from "../components/task/TaskModal";
import TaskSortDropdown from "../components/task/TaskSortDropdown";
import BoardAnalytics from "../components/board/BoardAnalytics";
import { getBoardById } from "../api/boardApi";
import { getTasksByBoard, updateTask } from "../api/taskApi";
import { sortTasks } from "../utils/taskUtils";

const STATUSES = ["todo", "inprogress", "done"];
const SORT_SESSION_KEY = "taskflow_sort";

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  // Sort — persisted in sessionStorage so it survives navigation within the session
  const [sortBy, setSortBy] = useState(
    () => sessionStorage.getItem(SORT_SESSION_KEY) || "newest"
  );

  function handleSortChange(val) {
    setSortBy(val);
    sessionStorage.setItem(SORT_SESSION_KEY, val);
  }

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("todo");

  const tasksBeforeDrag = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [boardData, tasksData] = await Promise.all([
        getBoardById(boardId),
        getTasksByBoard(boardId),
      ]);
      setBoard(boardData);
      setTasks(tasksData);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived: group + sort tasks per column ───────────────────────────────
  const tasksByStatus = useMemo(() => {
    const map = { todo: [], inprogress: [], done: [] };
    tasks.forEach((t) => {
      if (map[t.status] !== undefined) map[t.status].push(t);
      else map.todo.push(t);
    });
    // Apply sort inside each column
    Object.keys(map).forEach((s) => {
      map[s] = sortTasks(map[s], sortBy);
    });
    return map;
  }, [tasks, sortBy]);

  // ── Progress bar ────────────────────────────────────────────────────────
  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasksByStatus.done.length / tasks.length) * 100);
  }, [tasks, tasksByStatus]);

  // ── DnD sensors ─────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  function handleDragStart({ active }) {
    setActiveTask(tasks.find((t) => t._id === active.id) || null);
    tasksBeforeDrag.current = tasks;
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;
    const overStatus = STATUSES.includes(over.id)
      ? over.id
      : tasks.find((t) => t._id === over.id)?.status;
    if (!overStatus || activeTask.status === overStatus) return;
    setTasks((prev) =>
      prev.map((t) => t._id === active.id ? { ...t, status: overStatus } : t)
    );
  }

  async function handleDragEnd({ active, over }) {
    setActiveTask(null);
    if (!over) return;
    const currentTask = tasks.find((t) => t._id === active.id);
    if (!currentTask) return;
    const finalStatus = STATUSES.includes(over.id)
      ? over.id
      : tasks.find((t) => t._id === over.id)?.status || currentTask.status;
    const previousStatus = tasksBeforeDrag.current?.find(
      (t) => t._id === active.id
    )?.status;
    if (previousStatus && previousStatus !== finalStatus) {
      try {
        await updateTask(active.id, { status: finalStatus });
      } catch {
        setTasks(tasksBeforeDrag.current);
        toast.error("Failed to update task status. Please try again.");
      }
    }
    tasksBeforeDrag.current = null;
  }

  function handleDragCancel() {
    if (tasksBeforeDrag.current) setTasks(tasksBeforeDrag.current);
    setActiveTask(null);
    tasksBeforeDrag.current = null;
  }

  // ── Modal handlers ───────────────────────────────────────────────────────
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

  function handleTaskSaved(savedTask) {
    setTasks((prev) => {
      const exists = prev.find((t) => t._id === savedTask._id);
      return exists
        ? prev.map((t) => (t._id === savedTask._id ? savedTask : t))
        : [...prev, savedTask];
    });
    setModalOpen(false);
    setEditingTask(null);
  }

  function handleTaskDeleted(taskId) {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setModalOpen(false);
    setEditingTask(null);
  }

  // ── Loading / error states ───────────────────────────────────────────────
  const Shell = ({ children }) => (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        {children}
      </div>
    </div>
  );

  if (loading) return (
    <Shell>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading board...</p>
        </div>
      </div>
    </Shell>
  );

  if (error) return (
    <Shell>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-medium">{error}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate("/boards")} className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
              Back to boards
            </button>
            <button onClick={fetchData} className="px-4 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors">
              Try again
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );

  return (
    <Shell>
      {/* Board header */}
      <div className="px-6 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
        <button
          onClick={() => navigate("/boards")}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
        >
          <ArrowLeft size={13} /> Back to boards
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: board?.color || "#6d28d9" }}
          >
            <KanbanSquare size={18} className="text-white/90" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-zinc-100 truncate">{board?.title}</h1>
            {board?.description && (
              <p className="text-xs text-zinc-500 truncate">{board.description}</p>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs text-zinc-500">
              {tasksByStatus.done.length}/{tasks.length} done
            </span>
            <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: board?.color || "#6d28d9" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto px-6 py-5 flex flex-col">
        {/* Analytics */}
        <BoardAnalytics tasks={tasks} boardColor={board?.color} />

        {/* Sort toolbar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <p className="text-xs text-zinc-600">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
          <TaskSortDropdown value={sortBy} onChange={handleSortChange} />
        </div>

        {/* Kanban */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-4 flex-1 min-w-max pb-2">
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
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                isDone={activeTask.status === "done"}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {modalOpen && (
        <TaskModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          task={editingTask}
          boardId={boardId}
          defaultStatus={defaultStatus}
          onSave={handleTaskSaved}
          onDelete={handleTaskDeleted}
        />
      )}
    </Shell>
  );
}
