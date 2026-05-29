// src/components/task/EmptyTasks.jsx
// Shown inside a TaskColumn when there are zero tasks for that status.
// Lightweight — no CTA (task creation comes in a later step).

import { StickyNote } from "lucide-react";

/**
 * @param {string} columnLabel - e.g. "Todo", "In Progress", "Done"
 */
export default function EmptyTasks({ columnLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      {/* Dashed-border icon container */}
      <div
        className="w-11 h-11 rounded-xl border border-dashed border-gray-700
                   flex items-center justify-center mb-3"
      >
        <StickyNote size={18} className="text-gray-600" />
      </div>
      <p className="text-gray-600 text-xs font-medium">No tasks yet</p>
      <p className="text-gray-700 text-[11px] mt-0.5">
        {columnLabel === "Done"
          ? "Completed tasks will appear here"
          : "Add a task to get started"}
      </p>
    </div>
  );
}
