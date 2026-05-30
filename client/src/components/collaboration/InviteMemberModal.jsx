import { useState } from "react";
import { X, UserPlus, Mail, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { ROLES, ROLE_CONFIG } from "../../utils/collaborationUtils";

export default function InviteMemberModal({ onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await onInvite?.({ email: email.trim(), role });
      toast.success(`Invite sent to ${email.trim()}`);
      onClose();
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <UserPlus size={13} className="text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-100">Invite Member</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                autoFocus
                className="
                  w-full pl-8 pr-3 py-2 text-sm rounded-lg
                  bg-zinc-800/80 border border-zinc-700/60 text-zinc-100
                  placeholder:text-zinc-600
                  focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20
                  transition-all
                "
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Role
            </label>
            <div className="flex gap-2">
              {ROLES.map((r) => {
                const cfg = ROLE_CONFIG[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`
                      flex-1 flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl border text-xs font-medium
                      transition-all duration-150
                      ${active
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ring-inset ${cfg.border}`
                        : "bg-zinc-800/50 border-zinc-700/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
                      }
                    `}
                  >
                    <span className="font-semibold">{cfg.label}</span>
                    <span className="text-[10px] opacity-70 font-normal">
                      {r === "admin" ? "Can manage board" : "View & edit tasks"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 px-4 py-2 text-sm rounded-lg font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
