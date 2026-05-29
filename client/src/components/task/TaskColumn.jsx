// src/components/task/TaskColumn.jsx
// A single Kanban column (Todo / In Progress / Done).
// Renders a header, scrollable task list, and empty state.
// Drag-and-drop wrapper will be added here in Day 4 — structure is ready.

import TaskCard  from "./TaskCard";
import EmptyTasks from "./EmptyTasks";

// ─── Column visual config ─────────────────────────────────────────────────────
// Keeps styling decisions co-located with the component that uses them.
const COLUMN_STYLES = {
  todo: {
    dotColor    : "bg-gray-400",
    countStyle  : "bg-gray-700/70 text-gray-400",
    headerBorder: "border-gray-700/60",
    glow        : "",
  },
  "inprogress": {
    dotColor    : "bg-indigo-400",
    countStyle  : "bg-indigo-900/50 text-indigo-300",
    headerBorder: "border-indigo-900/40",
    glow        : "shadow-indigo-900/10",
  },
  done: {
    dotColor    : "bg-emerald-400",
    countStyle  : "bg-emerald-900/50 text-emerald-300",
    headerBorder: "border-emerald-900/40",
    glow        : "shadow-emerald-900/10",
  },
};

const COLUMN_LABELS = {
  todo          : "Todo",
  "inprogress" : "In Progress",
  done          : "Done",
};

/**
 * @param {string}   status   - "todo" | "in-progress" | "done"
 * @param {Array}    tasks    - Filtered task array for this column
 * @param {Function} onCardClick - Passed down to TaskCard (future: open detail)
 */
export default function TaskColumn({ status, tasks, onCardClick }) {
  const styles = COLUMN_STYLES[status] ?? COLUMN_STYLES.todo;
  const label  = COLUMN_LABELS[status] ?? status;
  const count  = tasks.length;

  return (
    /*
     * Fixed width + full column height.
     * overflow-y-auto → column scrolls independently when tasks overflow.
     * flex-shrink-0   → prevents column from collapsing in the flex row.
     */
    <div
      className={`
        flex flex-col flex-shrink-0
        w-72 md:w-80
        h-full
        bg-gray-900/50 backdrop-blur-sm
        border border-gray-800/80
        rounded-2xl
        shadow-lg ${styles.glow}
        overflow-hidden
      `}
    >
      {/* ── Column header ── */}
      <div
        className={`
          flex items-center justify-between
          px-4 py-3.5
          border-b ${styles.headerBorder}
          flex-shrink-0
        `}
      >
        <div className="flex items-center gap-2.5">
          {/* Status dot */}
          <span className={`w-2.5 h-2.5 rounded-full ${styles.dotColor}`} />
          {/* Column title */}
          <h3 className="text-sm font-semibold text-gray-200 tracking-tight">
            {label}
          </h3>
        </div>

        {/* Task count badge */}
        <span
          className={`
            px-2 py-0.5 rounded-full
            text-xs font-semibold
            ${styles.countStyle}
          `}
        >
          {count}
        </span>
      </div>

      {/* ── Scrollable task list ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
        {count === 0 ? (
          <EmptyTasks columnLabel={label} />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
