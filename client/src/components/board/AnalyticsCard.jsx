export default function AnalyticsCard({ label, value, sub, icon: Icon, color, trend }) {
    return (
      <div
        className={`
          relative flex flex-col gap-2 p-4 rounded-xl
          bg-zinc-900 border border-zinc-800
          hover:border-zinc-700 transition-all duration-200
          overflow-hidden
        `}
      >
        {/* Background accent glow */}
        <div
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl"
          style={{ backgroundColor: color }}
        />
  
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-medium">{label}</span>
          {Icon && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon size={13} style={{ color }} />
            </div>
          )}
        </div>
  
        {/* Value */}
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-zinc-100 leading-none tabular-nums">
            {value}
          </span>
          {sub && (
            <span className="text-xs text-zinc-600 mb-0.5 leading-tight">{sub}</span>
          )}
        </div>
  
        {/* Optional trend bar */}
        {trend !== undefined && (
          <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(trend, 100)}%`, backgroundColor: color }}
            />
          </div>
        )}
      </div>
    );
  }
  