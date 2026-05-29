// src/components/task/EmptyTasks.jsx

import {
    Plus,
    CheckCircle2,
    Clock,
    CircleDot,
  } from "lucide-react";
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Empty-state config per column
  // ─────────────────────────────────────────────────────────────────────────────
  
  const CONFIG = {
    todo: {
      icon: CircleDot,
      label: "No tasks yet",
      sub: "Drop a task here or click + to create one",
      iconColor: "text-gray-600",
    },
  
    inprogress: {
      icon: Clock,
      label: "Nothing in progress",
      sub: "Drop a task here to start working on it",
      iconColor: "text-indigo-700",
    },
  
    done: {
      icon: CheckCircle2,
      label: "No completed tasks",
      sub: "Completed tasks will appear here",
      iconColor: "text-emerald-700",
    },
  };
  
  /**
   * @param {string} status
   * @param {boolean} isDraggedOver
   * @param {Function} onAddTask
   */
  export default function EmptyTasks({
    status,
    isDraggedOver = false,
    onAddTask,
  }) {
    const config = CONFIG[status] ?? CONFIG.todo;
  
    const Icon = config.icon;
  
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          gap-2
          py-8 px-4
          rounded-xl
          border-2 border-dashed
          text-center
  
          transition-all duration-200
  
          ${
            isDraggedOver
              ? `
                border-indigo-500/60
                bg-indigo-500/5
                scale-[1.01]
              `
              : `
                border-gray-700/60
              `
          }
        `}
      >
        {/* Icon */}
        <Icon
          size={28}
          className={`
            transition-colors duration-200
            ${
              isDraggedOver
                ? "text-indigo-400"
                : config.iconColor
            }
          `}
        />
  
        {/* Main label */}
        <p className="text-xs font-medium text-gray-400">
          {config.label}
        </p>
  
        {/* Sub text */}
        <p className="text-[11px] text-gray-600 max-w-[180px] leading-relaxed">
          {config.sub}
        </p>
  
        {/* Add button */}
        {!isDraggedOver && (
          <button
            onClick={onAddTask}
            className="
              mt-1
              flex items-center gap-1
              text-[11px]
              text-gray-500
              hover:text-indigo-400
              transition-colors duration-150
            "
          >
            <Plus size={11} />
            Add task
          </button>
        )}
      </div>
    );
  }