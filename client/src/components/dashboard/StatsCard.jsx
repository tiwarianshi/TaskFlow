// ─── StatsCard ────────────────────────────────────────────────────────────────
// A reusable card for showing a single stat (e.g. "Total Tasks: 24").
//
// Props:
//   title  — label shown above the number (e.g. "Total Tasks")
//   value  — the number or text to display prominently (e.g. 24)
//   icon   — a JSX element (SVG) shown in the colored circle
//   color  — Tailwind color class for the icon background (e.g. "bg-indigo-500/20")
//   iconColor — Tailwind text color for the icon (e.g. "text-indigo-400")

function StatsCard({ title, value, icon, color = "bg-indigo-500/20", iconColor = "text-indigo-400" }) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5
                      flex items-center gap-4
                      hover:border-gray-700 transition-colors duration-150">
  
        {/* Icon circle */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <span className={iconColor}>
            {icon}
          </span>
        </div>
  
        {/* Text content */}
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        </div>
  
      </div>
    );
  }
  
  export default StatsCard;
  