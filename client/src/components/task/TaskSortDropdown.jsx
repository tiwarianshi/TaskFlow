import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "../../utils/taskUtils";

export default function TaskSortDropdown({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={13} className="text-zinc-500 flex-shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          text-xs bg-zinc-800/80 border border-zinc-700/60 text-zinc-300
          rounded-lg px-2.5 py-1.5 cursor-pointer
          focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
          hover:border-zinc-600 transition-all duration-150
          appearance-none pr-6
        "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2371717a' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
