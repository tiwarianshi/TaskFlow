import { useState } from "react";
import { UserPlus, X, Shield } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import { ROLE_CONFIG, getInitials, getAvatarColor } from "../../utils/collaborationUtils";
import UserAvatar from "../users/UserAvatar";

const MAX_SHOWN = 4;

export default function BoardMembers({ members = [], loading, onInvite, onRemove }) {
  const [panelOpen, setPanelOpen] = useState(false);

  const shown = members.slice(0, MAX_SHOWN);
  const overflow = members.length - MAX_SHOWN;

  return (
    <div className="flex items-center gap-2">
      {/* Stacked avatars */}
      <div className="flex items-center">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse border-2 border-zinc-900"
                style={{ marginLeft: i > 0 ? "-6px" : "0" }}
              />
            ))}
          </>
        ) : (
          <>
            {shown.map((member, i) => (
              <div
                key={member._id}
                style={{ marginLeft: i > 0 ? "-6px" : "0", zIndex: shown.length - i }}
                className="relative"
              >
                <MemberAvatar member={member} size="md" />
              </div>
            ))}
            {overflow > 0 && (
              <div
                className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-semibold text-zinc-300"
                style={{ marginLeft: "-6px" }}
              >
                +{overflow}
              </div>
            )}
          </>
        )}
      </div>

      {/* Manage / invite button */}
      <button
        onClick={() => setPanelOpen(true)}
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
          bg-zinc-800/80 border border-zinc-700/50 text-zinc-400
          hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800
          transition-all duration-150
        "
      >
        <UserPlus size={12} />
        <span className="hidden sm:inline">Invite</span>
      </button>

      {/* Slide-over member panel */}
      {panelOpen && (
        <MemberPanel
          members={members}
          onClose={() => setPanelOpen(false)}
          onInvite={() => { setPanelOpen(false); onInvite?.(); }}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

function MemberPanel({ members, onClose, onInvite, onRemove }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        fixed top-0 right-0 bottom-0 z-50 w-72
        bg-zinc-950 border-l border-zinc-800
        flex flex-col shadow-2xl
        animate-in slide-in-from-right duration-200
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-100">Members</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
              {members.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {members.map((member) => {
            const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
            return (
              <div
                key={member._id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900 group transition-colors"
              >
                <UserAvatar user={member} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{member.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{member.email}</p>
                </div>
                <span className={`
                  flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border
                  ${roleCfg.color} ${roleCfg.bg} ${roleCfg.border}
                `}>
                  {roleCfg.label}
                </span>
                {member.role !== "owner" && (
                  <button
                    onClick={() => onRemove?.(member._id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={onInvite}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-2.5
              rounded-xl bg-violet-600 hover:bg-violet-500
              text-white text-sm font-medium transition-colors
            "
          >
            <UserPlus size={14} /> Invite Member
          </button>
        </div>
      </div>
    </>
  );
}
