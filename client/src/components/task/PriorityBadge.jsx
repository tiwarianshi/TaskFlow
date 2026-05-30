import { getPriorityConfig } from "../../utils/taskUtils";

/**
 * PriorityBadge
 * size: "sm" | "md"
 * showLabel: boolean
 */
export default function PriorityBadge({ priority, size = "sm", showLabel = true }) {
  if (!priority) return null;
  const cfg = getPriorityConfig(priority);

  if (size === "md") {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
          border ${cfg.bg} ${cfg.color} ${cfg.border}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {showLabel && cfg.label}
      </span>
    );
  }

  // sm (default — used inside TaskCard)
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium
        border ${cfg.bg} ${cfg.color} ${cfg.border}
      `}
    >
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {showLabel && cfg.label}
    </span>
  );
}
