import UserAvatar from "../users/UserAvatar";
import { ROLE_CONFIG } from "../../utils/collaborationUtils";

export default function MemberAvatar({ member, size = "md", showRole = false }) {
  const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;

  return (
    <div className="relative flex-shrink-0">
      <UserAvatar user={member} size={size} showTooltip />

      {/* Crown dot for owner */}
      {member.role === "owner" && (
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-zinc-900" />
      )}

      {/* Inline role badge (used in member list, not stack) */}
      {showRole && (
        <span className={`
          ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold
          border ${roleCfg.color} ${roleCfg.bg} ${roleCfg.border}
        `}>
          {roleCfg.label}
        </span>
      )}
    </div>
  );
}
