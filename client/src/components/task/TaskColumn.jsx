import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import EmptyTasks from "./EmptyTasks";

const COLUMN_CONFIG = {
  todo:       { label: "Todo",        dot: "bg-zinc-400",    header: "text-zinc-300",    badge: "bg-zinc-700 text-zinc-300",         ring: "ring-zinc-600/40",    highlight: "bg-zinc-700/20"    },
  inprogress: { label: "In Progress", dot: "bg-blue-400",    header: "text-blue-300",    badge: "bg-blue-900/50 text-blue-300",      ring: "ring-blue-500/30",    highlight: "bg-blue-900/10"    },
  done:       { label: "Done",        dot: "bg-emerald-400", header: "text-emerald-300", badge: "bg-emerald-900/50 text-emerald-300", ring: "ring-emerald-500/30", highlight: "bg-emerald-900/10" },
};

export default function TaskColumn({ status, tasks, onAddTask, onEditTask, activeId, members = [] }) {
  const config  = COLUMN_CONFIG[status] || COLUMN_CONFIG.todo;
  const taskIds = tasks.map((t) => t._id);
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`
      flex flex-col w-72 md:w-80 flex-shrink-0 rounded-2xl
      bg-zinc-900/80 border border-zinc-800
      transition-all duration-200
      ${isOver ? `ring-2 ${config.ring} ${config.highlight}` : ""}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h3 className={`text-sm font-semibold ${config.header}`}>{config.label}</h3>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${config.badge}`}>{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask?.(status)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-all duration-150"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 min-h-[120px] transition-colors duration-200 ${isOver && tasks.length === 0 ? "justify-center items-center" : ""}`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyTasks
              status={status}
              isDraggedOver={isOver}
              onAddTask={() => onAddTask?.(status)}
            />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEditTask}
                isDone={status === "done"}
                members={members}
              />
            ))
          )}
        </SortableContext>
        {tasks.length > 0 && <div className="h-2 flex-shrink-0" />}
      </div>
    </div>
  );
}
