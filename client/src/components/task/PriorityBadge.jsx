// src/components/task/PriorityBadge.jsx
// Standalone priority badge used inside TaskCard.
// Kept separate so it can be reused in modals, filters, etc. later.

// Config maps priority string → visual tokens
const CONFIG = {
    high: {
      label: "High",
      bar: "bg-red-500",
      pill: "bg-red-500/10 text-red-400 border-red-500/20",
      dot: "bg-red-400",
    },
    medium: {
      label: "Medium",
      bar: "bg-amber-500",
      pill: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    low: {
      label: "Low",
      bar: "bg-sky-500",
      pill: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      dot: "bg-sky-400",
    },
  };
  
  /**
   * @param {string}  priority  - "high" | "medium" | "low"
   * @param {string}  className - optional extra Tailwind classes
   */
  export default function PriorityBadge({ priority, className = "" }) {
    const cfg = CONFIG[priority] ?? CONFIG.low;
  
    return (
      <span
        className={`
          inline-flex items-center gap-1.5
          px-2 py-0.5 rounded-md
          text-[10px] font-semibold tracking-widest uppercase
          border ${cfg.pill} ${className}
        `}
      >
        {/* Pulsing dot for high priority only */}
        {priority === "high" ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
          </span>
        ) : (
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        )}
        {cfg.label}
      </span>
    );
  }
  