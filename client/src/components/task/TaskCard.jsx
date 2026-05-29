// src/components/task/TaskCard.jsx
// Draggable task card using dnd-kit sortable.

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Calendar, GripVertical } from "lucide-react";

import PriorityBadge from "./PriorityBadge";

// ─────────────────────────────────────────────────────────────────────────────
// Due date helpers
// ─────────────────────────────────────────────────────────────────────────────

function getDueDateState(dateStr) {
  if (!dateStr) return null;

  const now = new Date();
  const due = new Date(dateStr);

  const diffDays = Math.ceil(
    (due - now) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 3) return "soon";

  return "normal";
}

const dueDateStyles = {
  overdue:
    "bg-red-500/15 text-red-400 border border-red-500/30",

  today:
    "bg-amber-500/15 text-amber-400 border border-amber-500/30",

  soon:
    "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",

  normal:
    "bg-gray-700/60 text-gray-400 border border-gray-600/40",
};

const priorityAccent = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
};

/**
 * @param {Object} task
 * @param {Function} onClick
 * @param {boolean} isOverlay
 */
export default function TaskCard({
  task,
  onClick,
  isOverlay = false,
}) {
  // ───────────────── DnD Sortable ─────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "task",
      task,
    },
  });

  // Smooth transform animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  const dueState = getDueDateState(task.dueDate);

  // ───────────────── Ghost Placeholder ─────────────────
  // Original position while dragging
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
          rounded-xl h-[118px]
          bg-gray-800/30
          border-2 border-dashed border-gray-700
        "
      />
    );
  }

  // ───────────────── Main Card ─────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isOverlay && onClick?.(task)}
      className={`
        group relative
        rounded-xl
        bg-gray-800
        border border-gray-700/70
        shadow-md
        cursor-pointer
        select-none

        transition-all duration-200

        ${
          isOverlay
            ? `
              rotate-2 scale-105
              border-gray-500
              shadow-2xl shadow-black/60
              ring-2 ring-indigo-500/40
            `
            : `
              hover:-translate-y-0.5
              hover:border-gray-600
              hover:shadow-xl hover:shadow-black/30
            `
        }
      `}
    >
      {/* Priority accent strip */}
      <div
        className={`
          absolute left-0 top-3 bottom-3
          w-[3px] rounded-full
          ${priorityAccent[task.priority] || "bg-gray-600"}
        `}
      />

      <div className="p-3 pl-4">

        {/* ───────────────── Header ───────────────── */}
        <div className="flex items-start gap-2">

          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="
              mt-0.5 flex-shrink-0
              text-gray-600 hover:text-gray-400
              transition-colors
              cursor-grab active:cursor-grabbing
            "
            aria-label="Drag task"
          >
            <GripVertical size={14} />
          </button>

          {/* Title */}
          <h3 className="flex-1 text-sm font-medium leading-snug text-gray-100">
            {task.title}
          </h3>
        </div>

        {/* ───────────────── Description ───────────────── */}
        {task.description && (
          <p
            className="
              mt-1.5 ml-5
              text-xs text-gray-500
              line-clamp-2
              leading-relaxed
            "
          >
            {task.description}
          </p>
        )}

        {/* ───────────────── Footer ───────────────── */}
        <div
          className="
            mt-3 ml-5
            flex items-center justify-between
            gap-2 flex-wrap
          "
        >
          <div className="flex items-center gap-1.5 flex-wrap">

            {/* Priority */}
            {task.priority && (
              <PriorityBadge priority={task.priority} />
            )}

            {/* Due Date */}
            {dueState && (
              <span
                className={`
                  flex items-center gap-1
                  px-1.5 py-0.5 rounded-md
                  text-[10px] font-medium
                  ${dueDateStyles[dueState]}
                `}
              >
                <Calendar size={9} />

                {new Date(task.dueDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}