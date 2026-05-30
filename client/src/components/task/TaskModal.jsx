import { useState, useEffect } from "react";
import { X, Trash2, Flag, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { createTask, updateTask, deleteTask } from "../../api/taskApi";
import { PRIORITY_CONFIG } from "../../utils/taskUtils";

const STATUSES = [
  { value: "todo", label: "Todo" },
  { value: "inprogress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITIES = ["urgent", "high", "medium", "low"];

export default function TaskModal({
  isOpen,
  onClose,
  task,
  boardId,
  defaultStatus = "todo",
  onSave,
  onDelete,
}) {
  const isEditing = Boolean(task);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: defaultStatus,
    priority: "medium",
    dueDate: "",
    assignee: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || defaultStatus,
        priority: task.priority || "medium",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        assignee: task.assignee || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        status: defaultStatus,
        priority: "medium",
        dueDate: "",
        assignee: "",
      });
    }
  }, [task, defaultStatus]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        board: boardId,
        dueDate: form.dueDate || null,
      };
      const saved = isEditing
        ? await updateTask(task._id, payload)
        : await createTask(payload);
      toast.success(isEditing ? "Task updated" : "Task created");
      onSave?.(saved);
    } catch {
      toast.error("Failed to save task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setDeleting(true);
    try {
      await deleteTask(task._id);
      toast.success("Task deleted");
      onDelete?.(task._id);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700/60 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="
                  w-full px-3 py-2 text-sm rounded-lg
                  bg-zinc-800/80 border border-zinc-700/60 text-zinc-100
                  placeholder:text-zinc-600
                  focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
                  transition-all
                "
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className="
                  w-full px-3 py-2 text-sm rounded-lg resize-none
                  bg-zinc-800/80 border border-zinc-700/60 text-zinc-100
                  placeholder:text-zinc-600
                  focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
                  transition-all
                "
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                  <Flag size={11} /> Priority
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITIES.map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const selected = form.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set("priority", p)}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border
                          transition-all duration-150
                          ${selected
                            ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ${cfg.ring}`
                            : "bg-zinc-800/60 text-zinc-500 border-zinc-700/40 hover:border-zinc-600"
                          }
                        `}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="
                    w-full px-3 py-2 text-xs rounded-lg
                    bg-zinc-800/80 border border-zinc-700/60 text-zinc-300
                    focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
                    transition-all appearance-none cursor-pointer
                  "
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due date + Assignee row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Due date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                  <Calendar size={11} /> Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                  className="
                    w-full px-3 py-2 text-xs rounded-lg
                    bg-zinc-800/80 border border-zinc-700/60 text-zinc-300
                    focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
                    transition-all cursor-pointer
                    [color-scheme:dark]
                  "
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Assignee
                </label>
                <input
                  type="text"
                  value={form.assignee}
                  onChange={(e) => set("assignee", e.target.value)}
                  placeholder="Name..."
                  className="
                    w-full px-3 py-2 text-xs rounded-lg
                    bg-zinc-800/80 border border-zinc-700/60 text-zinc-100
                    placeholder:text-zinc-600
                    focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
                    transition-all
                  "
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 px-5 py-4 border-t border-zinc-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="flex-1 px-4 py-2 text-sm rounded-lg font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Saving…" : isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
