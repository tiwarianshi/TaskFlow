// src/components/task/TaskCard.jsx
// Individual task card for the Kanban board.
// Drag-and-drop support can be added later.

import { Calendar, AlertCircle, Clock } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

// ─── Date helper ─────────────────────────────────────────────────────────────
function parseDueDate(dateStr) {
  if (!dateStr) return null;

  const due = new Date(dateStr);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const dueDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );

  const diff = Math.round((dueDay - today) / 86_400_000);

  return {
    label: due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    isOverdue: diff < 0,
    isToday: diff === 0,
    isSoon: diff > 0 && diff <= 2,
  };
}

// ─── Due-date color styles ──────────────────────────────────────────────────
function dueDateStyle(due) {
  if (due.isOverdue) {
    return "text-red-400 bg-red-400/10 border-red-400/20";
  }

  if (due.isToday) {
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  }

  if (due.isSoon) {
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  }

  return "text-gray-500 bg-gray-800/60 border-gray-700";
}

/**
 * @param {Object}   task
 * @param {Function} onClick
 */
export default function TaskCard({ task, onClick }) {
  const due = parseDueDate(task.dueDate);

  const isDone = task.status === "done";

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`
        group relative
        bg-gray-800/60 backdrop-blur-sm
        border border-gray-700/50
        rounded-xl p-4
        cursor-pointer select-none
        hover:bg-gray-800/90
        hover:border-gray-600/70
        hover:shadow-xl hover:shadow-black/40
        hover:-translate-y-[3px]
        transition-all duration-200 ease-out
        ${isDone ? "opacity-60" : ""}
      `}
    >
      {/* ── Left priority accent bar ── */}
      <div
        className={`
          absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full
          transition-opacity duration-200

          ${
            task.priority === "high"
              ? "bg-red-500 opacity-70 group-hover:opacity-100"
              : ""
          }

          ${
            task.priority === "medium"
              ? "bg-amber-500 opacity-70 group-hover:opacity-100"
              : ""
          }

          ${
            task.priority === "low"
              ? "bg-sky-500 opacity-70 group-hover:opacity-100"
              : ""
          }
        `}
      />

      {/* ── Task title ── */}
      <h4
        className={`
          text-[13px] font-semibold leading-snug mb-1.5 pl-1
          ${
            isDone
              ? "line-through text-gray-500"
              : "text-gray-100 group-hover:text-white"
          }
          transition-colors duration-150
        `}
      >
        {task.title}
      </h4>

      {/* ── Description ── */}
      {task.description && (
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed pl-1 mb-3">
          {task.description}
        </p>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-2 pl-1 mt-3 pt-2.5 border-t border-gray-700/50">
        
        {/* Priority */}
        <PriorityBadge priority={task.priority} />

        {/* Due date */}
        {due && (
          <span
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5
              rounded-md border text-[10px] font-medium
              ${dueDateStyle(due)}
            `}
          >
            {due.isOverdue ? (
              <AlertCircle size={10} />
            ) : due.isToday || due.isSoon ? (
              <Clock size={10} />
            ) : (
              <Calendar size={10} />
            )}

            {due.isToday ? "Today" : due.label}
          </span>
        )}
      </div>
    </div>
  );
}