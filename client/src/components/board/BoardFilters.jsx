import { LayoutGrid, Star, Clock } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All Boards", icon: LayoutGrid },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "recent", label: "Recent", icon: Clock },
];

export default function BoardFilters({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-1 bg-zinc-800/60 rounded-lg p-1 border border-zinc-700/40">
      {FILTERS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        const count = counts?.[id];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              transition-all duration-150 whitespace-nowrap
              ${isActive
                ? "bg-zinc-700 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/40"
              }
            `}
          >
            <Icon size={12} className={isActive ? "text-violet-400" : ""} />
            <span className="hidden sm:inline">{label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isActive ? "bg-zinc-600 text-zinc-300" : "bg-zinc-700/60 text-zinc-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
