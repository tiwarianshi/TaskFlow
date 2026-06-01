import { getInitials, getAvatarColor } from "../../utils/collaborationUtils";

const SIZE_MAP = {
  xs: { outer: "w-5 h-5",  text: "text-[9px]",  ring: "ring-1" },
  sm: { outer: "w-6 h-6",  text: "text-[10px]", ring: "ring-1" },
  md: { outer: "w-7 h-7",  text: "text-xs",     ring: "ring-1" },
  lg: { outer: "w-8 h-8",  text: "text-xs",     ring: "ring-2" },
  xl: { outer: "w-10 h-10",text: "text-sm",     ring: "ring-2" },
};

/**
 * UserAvatar
 * @param {object} user  — { name, avatar, email }
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} size
 * @param {boolean} showTooltip
 * @param {string} className  — extra classes
 */
export default function UserAvatar({
  user,
  size = "md",
  showTooltip = false,
  className = "",
}) {
  if (!user) return null;
  const sz = SIZE_MAP[size] || SIZE_MAP.md;
  const displayName = typeof user.name === "string"
    ? user.name
    : typeof user.email === "string"
      ? user.email
      : "";
  const color = getAvatarColor(displayName);
  const initials = getInitials(displayName);
  const tooltipLabel = displayName || "User";

  return (
    <div className={`relative group flex-shrink-0 ${className}`}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={tooltipLabel}
          className={`${sz.outer} rounded-full object-cover ${sz.ring} ring-zinc-900`}
        />
      ) : (
        <div
          className={`
            ${sz.outer} ${sz.text} ${sz.ring} ring-zinc-900
            rounded-full flex items-center justify-center
            font-semibold select-none flex-shrink-0
            ${color.bg} ${color.text}
          `}
        >
          {initials}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1
          bg-zinc-800 border border-zinc-700 text-zinc-200
          text-[10px] font-medium rounded-lg whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 z-50
          shadow-lg
        ">
          {tooltipLabel}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
        </div>
      )}
    </div>
  );
}
