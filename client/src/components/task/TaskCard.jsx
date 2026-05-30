import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import DueDateBadge from "./DueDateBadge";
import { getDueDateInfo, getPriorityConfig } from "../../utils/taskUtils";

function stringToHue(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export default function TaskCard({ task, onEdit, isDone, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const dueDateInfo = getDueDateInfo(task.dueDate, isDone);
  const isOverdue = !isDone && dueDateInfo?.state === "overdue";
  const priorityCfg = getPriorityConfig(task.priority);
  const hue = stringToHue(task.assignee || "");

  // Ghost placeholder while dragging
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl h-[112px] bg-zinc-800/40 border-2 border-dashed border-zinc-600/50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isOverlay && onEdit?.(task)}
      className={`
        group relative rounded-xl bg-zinc-800 border cursor-pointer select-none
        transition-all duration-200
        ${isOverdue
          ? "border-red-500/25 shadow-sm shadow-red-500/10"
          : "border-zinc-700/60"
        }
        ${isOverlay
          ? "shadow-2xl rotate-2 scale-105 border-zinc-500/80 ring-2 ring-violet-500/40"
          : "hover:-translate-y-[3px] hover:shadow-xl hover:border-zinc-600"
        }
        ${isDone ? "opacity-60" : ""}
      `}
    >
      {/* Priority accent bar */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${priorityCfg.dot}`}
      />

      <div className="p-3 pl-4">
        {/* Header: grip + title */}
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className={`
              mt-0.5 flex-shrink-0 text-zinc-600 hover:text-zinc-400
              transition-colors cursor-grab active:cursor-grabbing
              ${isOverlay ? "cursor-grabbing" : ""}
            `}
            aria-label="Drag task"
          >
            <GripVertical size={14} />
          </button>

          <h3
            className={`flex-1 text-sm font-medium leading-snug text-zinc-100 ${
              isDone ? "line-through text-zinc-400" : ""
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Description */}
        {task.description && (
          <p className="mt-1.5 ml-5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Badges row */}
        <div className="mt-2.5 ml-5 flex items-center gap-1.5 flex-wrap">
          {task.priority && <PriorityBadge priority={task.priority} />}
          <DueDateBadge dueDateStr={task.dueDate} isCompleted={isDone} />
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="mt-2 ml-5 flex justify-end">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
              style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
              title={task.assignee}
            >
              {task.assignee.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
