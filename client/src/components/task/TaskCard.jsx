import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import PriorityBadge from "./PriorityBadge";
import DueDateBadge from "./DueDateBadge";
import UserAvatar from "../users/UserAvatar";

import {
  getDueDateInfo,
  getPriorityConfig,
} from "../../utils/taskUtils";

export default function TaskCard({
  task,
  onEdit,
  isDone,
  isOverlay = false,
  members = [],
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  const dueDateInfo = getDueDateInfo(
    task.dueDate,
    isDone
  );

  const isOverdue =
    !isDone && dueDateInfo?.state === "overdue";

  const priorityCfg = getPriorityConfig(task.priority);

  // Resolve assignee
  const assigneeMember =
    members.find(
      (m) =>
        m._id ===
        (task.assigneeId || task.assignee)
    ) || null;

  const assigneeUser = assigneeMember
    ? assigneeMember
    : task.assignee
    ? {
        name: task.assignee,
        email: task.assignee,
      }
    : null;

  // Placeholder while dragging
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
          rounded-xl h-[108px]
          bg-zinc-800/40
          border-2 border-dashed border-zinc-600/50
        "
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isOverlay && onEdit?.(task)}
      className={`
        group relative rounded-xl
        bg-zinc-800 border
        cursor-pointer select-none
        transition-all duration-200
        ${isOverlay ? "z-50" : ""}

        ${
          isOverdue
            ? "border-red-500/25 shadow-sm shadow-red-500/10"
            : "border-zinc-700/60"
        }

        ${
          isOverlay
            ? "shadow-2xl rotate-2 scale-105 border-zinc-500/80 ring-2 ring-violet-500/40"
            : "hover:-translate-y-[3px] hover:shadow-xl hover:border-zinc-600"
        }

        ${isDone ? "opacity-60" : ""}
      `}
    >
      {/* Priority Accent Bar */}
      <div
        className={`
          absolute left-0 top-3 bottom-3
          w-[3px] rounded-full
          ${priorityCfg.dot}
        `}
      />

      <div className="p-3 pl-4">
        {/* Header */}
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className={`
              mt-0.5 flex-shrink-0
              text-zinc-600 hover:text-zinc-400
              transition-colors
              cursor-grab active:cursor-grabbing
              ${isOverlay ? "cursor-grabbing" : ""}
            `}
            aria-label="Drag task"
          >
            <GripVertical size={14} />
          </button>

          {/* Title */}
          <h3
            className={`
              flex-1 text-sm font-medium
              leading-snug text-zinc-100
              ${
                isDone
                  ? "line-through text-zinc-400"
                  : ""
              }
            `}
          >
            {task.title}
          </h3>
        </div>

        {/* Description */}
        {task.description && (
          <p
            className="
              mt-1.5 ml-5
              text-xs text-zinc-500
              line-clamp-2 leading-relaxed
            "
          >
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div
          className="
            mt-2.5 ml-5
            flex items-center justify-between
            gap-2 flex-wrap
          "
        >
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.priority && (
              <PriorityBadge priority={task.priority} />
            )}

            <DueDateBadge
              dueDateStr={task.dueDate}
              isCompleted={isDone}
            />
          </div>

          {/* Assignee */}
          {assigneeUser && (
            <UserAvatar
              user={assigneeUser}
              size="sm"
              showTooltip
              className="flex-shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}