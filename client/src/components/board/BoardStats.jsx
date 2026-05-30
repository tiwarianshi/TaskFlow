import { CheckCircle2, Circle } from "lucide-react";

export default function BoardStats({ stats, color, compact = false }) {
  if (!stats) return null;
  const { total = 0, completed = 0 } = stats;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (compact) {
    // Inline version for board card footer
    return (
        <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-zinc-700/60 rounded-full overflow-hidden">
        <div
  className="h-full rounded-full transition-all duration-700"
  style={{
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${
      color || "#a855f7"
    }, ${
      color || "#7c3aed"
    })`,
  }}
/>
        </div>
      
        <span className="text-[10px] text-zinc-400 flex-shrink-0 font-medium">
          {pct}% • {completed}/{total}
        </span>
      </div>
    );
  }

  // Full version
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-500" />
            {completed} done
          </span>
          <span className="flex items-center gap-1">
            <Circle size={11} className="text-zinc-600" />
            {total - completed} left
          </span>
        </div>
        <span className="font-medium text-zinc-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-zinc-700/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color || "#6d28d9" }}
        />
      </div>
    </div>
  );
}
