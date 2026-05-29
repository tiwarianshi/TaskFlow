// src/components/task/TaskColumn.jsx
// Kanban column with drag-and-drop support using dnd-kit.

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus } from "lucide-react";

import TaskCard from "./TaskCard";
import EmptyTasks from "./EmptyTasks";

// ─────────────────────────────────────────────────────────────────────────────
// Column UI config
// ─────────────────────────────────────────────────────────────────────────────

const COLUMN_STYLES = {
  todo: {
    label: "Todo",
    dotColor: "bg-gray-400",
    countStyle: "bg-gray-700/70 text-gray-400",
    headerBorder: "border-gray-700/60",
    glow: "",
    ring: "ring-gray-500/30",
    highlight: "bg-gray-800/40",
  },

  inprogress: {
    label: "In Progress",
    dotColor: "bg-indigo-400",
    countStyle: "bg-indigo-900/50 text-indigo-300",
    headerBorder: "border-indigo-900/40",
    glow: "shadow-indigo-900/10",
    ring: "ring-indigo-500/30",
    highlight: "bg-indigo-500/5",
  },

  done: {
    label: "Done",
    dotColor: "bg-emerald-400",
    countStyle: "bg-emerald-900/50 text-emerald-300",
    headerBorder: "border-emerald-900/40",
    glow: "shadow-emerald-900/10",
    ring: "ring-emerald-500/30",
    highlight: "bg-emerald-500/5",
  },
};

/**
 * @param {string} status
 * @param {Array} tasks
 * @param {Function} onAddTask
 * @param {Function} onEditTask
 */
export default function TaskColumn({
  status,
  tasks = [],
  onAddTask,
  onEditTask,
}) {
  const styles = COLUMN_STYLES[status] ?? COLUMN_STYLES.todo;

  // Task IDs required by SortableContext
  const taskIds = tasks.map((task) => task._id);

  // Make whole column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      className={`
        flex flex-col flex-shrink-0
        w-72 md:w-80
        h-full
        bg-gray-900/50 backdrop-blur-sm
        border border-gray-800/80
        rounded-2xl
        overflow-hidden
        shadow-lg ${styles.glow}
        transition-all duration-200

        ${
          isOver
            ? `ring-2 ${styles.ring} ${styles.highlight}`
            : ""
        }
      `}
    >
      {/* ───────────────── Header ───────────────── */}
      <div
        className={`
          flex items-center justify-between
          px-4 py-3.5
          border-b ${styles.headerBorder}
          flex-shrink-0
        `}
      >
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${styles.dotColor}`}
          />

          <h3 className="text-sm font-semibold text-gray-200 tracking-tight">
            {styles.label}
          </h3>

          <span
            className={`
              px-2 py-0.5 rounded-full
              text-xs font-semibold
              ${styles.countStyle}
            `}
          >
            {tasks.length}
          </span>
        </div>

        {/* Add task button */}
        <button
          onClick={() => onAddTask?.(status)}
          className="
            w-7 h-7 rounded-lg
            flex items-center justify-center
            text-gray-500 hover:text-white
            hover:bg-gray-800
            transition-colors duration-150
          "
          title={`Add task to ${styles.label}`}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* ───────────────── Task List ───────────────── */}
      <div
        ref={setNodeRef}
        className="
          flex-1 overflow-y-auto
          p-3 space-y-2.5
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-gray-700
          min-h-[120px]
        "
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <EmptyTasks columnLabel={styles.label} />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={onEditTask}
              />
            ))
          )}
        </SortableContext>

        {/* Extra bottom spacing for easier dropping */}
        {tasks.length > 0 && (
          <div className="h-2 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}