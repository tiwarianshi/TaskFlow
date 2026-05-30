// ─── Priority ─────────────────────────────────────────────────────────────────

export const PRIORITY_CONFIG = {
    urgent: {
      label: "Urgent",
      color: "text-red-400",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      dot: "bg-red-400",
      ring: "ring-red-500/40",
      order: 0,
    },
    high: {
      label: "High",
      color: "text-orange-400",
      bg: "bg-orange-500/15",
      border: "border-orange-500/30",
      dot: "bg-orange-400",
      ring: "ring-orange-500/40",
      order: 1,
    },
    medium: {
      label: "Medium",
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
      dot: "bg-blue-400",
      ring: "ring-blue-500/40",
      order: 2,
    },
    low: {
      label: "Low",
      color: "text-zinc-400",
      bg: "bg-zinc-500/15",
      border: "border-zinc-500/30",
      dot: "bg-zinc-500",
      ring: "ring-zinc-500/40",
      order: 3,
    },
  };
  
  export const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
  
  export function getPriorityConfig(priority) {
    return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  }
  
  // ─── Due date ─────────────────────────────────────────────────────────────────
  
  /**
   * Returns a display object for a due date string.
   * { label, state: "overdue" | "today" | "tomorrow" | "soon" | "normal" | null }
   */
  export function getDueDateInfo(dueDateStr, isCompleted = false) {
    if (!dueDateStr) return null;
  
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
  
    let label;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Tomorrow";
    else if (diffDays === -1) label = "Yesterday";
    else if (diffDays < 0) label = `Overdue by ${Math.abs(diffDays)}d`;
    else
      label = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  
    let state;
    if (isCompleted) state = "normal";
    else if (diffDays < 0) state = "overdue";
    else if (diffDays === 0) state = "today";
    else if (diffDays === 1) state = "tomorrow";
    else if (diffDays <= 3) state = "soon";
    else state = "normal";
  
    return { label, state, diffDays };
  }
  
  export const DUE_DATE_STYLES = {
    overdue: {
      chip: "bg-red-500/15 text-red-400 border border-red-500/30",
      glow: "shadow-red-500/20",
      cardBorder: "border-red-500/25",
    },
    today: {
      chip: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      glow: "",
      cardBorder: "border-amber-500/20",
    },
    tomorrow: {
      chip: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
      glow: "",
      cardBorder: "",
    },
    soon: {
      chip: "bg-zinc-700/60 text-zinc-400 border border-zinc-600/40",
      glow: "",
      cardBorder: "",
    },
    normal: {
      chip: "bg-zinc-800/60 text-zinc-500 border border-zinc-700/40",
      glow: "",
      cardBorder: "",
    },
  };
  
  // ─── Sorting ──────────────────────────────────────────────────────────────────
  
  export const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "priority", label: "Priority" },
    { value: "dueDate", label: "Due date" },
  ];
  
  export function sortTasks(tasks, sortBy) {
    if (!tasks || !sortBy) return tasks;
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority":
          return (
            (PRIORITY_ORDER[a.priority] ?? 99) -
            (PRIORITY_ORDER[b.priority] ?? 99)
          );
        case "dueDate": {
          // Tasks with no due date sink to the bottom
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        default:
          return 0;
      }
    });
  }
  