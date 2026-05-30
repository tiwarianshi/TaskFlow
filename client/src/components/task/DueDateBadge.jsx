import { Calendar } from "lucide-react";
import { getDueDateInfo, DUE_DATE_STYLES } from "../../utils/taskUtils";

/**
 * DueDateBadge
 * dueDateStr: ISO date string
 * isCompleted: boolean — suppresses overdue styling for done tasks
 */
export default function DueDateBadge({ dueDateStr, isCompleted = false }) {
  const info = getDueDateInfo(dueDateStr, isCompleted);
  if (!info) return null;

  const styles = DUE_DATE_STYLES[info.state] || DUE_DATE_STYLES.normal;

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium
        ${styles.chip}
        ${info.state === "overdue" ? `shadow-sm ${styles.glow}` : ""}
      `}
    >
      <Calendar size={9} className="flex-shrink-0" />
      {info.label}
    </span>
  );
}
