import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  BarChart2,
  ChevronDown,
} from "lucide-react";
import AnalyticsCard from "./AnalyticsCard";
import { getDueDateInfo } from "../../utils/taskUtils";

export default function BoardAnalytics({ tasks, boardColor }) {
  const [collapsed, setCollapsed] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => {
      if (t.status === "done") return false;
      const info = getDueDateInfo(t.dueDate, false);
      return info?.state === "overdue";
    }).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, pct };
  }, [tasks]);

  const accent = boardColor || "#6d28d9";

  return (
    <div className="mb-5">
      {/* Toggle header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 mb-3 group"
      >
        <BarChart2 size={13} className="text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
          Analytics
        </span>
        <ChevronDown
          size={12}
          className={`text-zinc-600 transition-transform duration-200 ${
            collapsed ? "-rotate-90" : ""
          }`}
        />
      </button>

      {!collapsed && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AnalyticsCard
            label="Total Tasks"
            value={stats.total}
            icon={Circle}
            color="#71717a"
          />
          <AnalyticsCard
            label="Completed"
            value={stats.completed}
            sub={`of ${stats.total}`}
            icon={CheckCircle2}
            color="#10b981"
            trend={stats.pct}
          />
          <AnalyticsCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color={stats.overdue > 0 ? "#ef4444" : "#71717a"}
          />
          <AnalyticsCard
            label="Completion"
            value={`${stats.pct}%`}
            icon={BarChart2}
            color={accent}
            trend={stats.pct}
          />
        </div>
      )}
    </div>
  );
}
