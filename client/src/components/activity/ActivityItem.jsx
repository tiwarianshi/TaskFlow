import {
    ArrowRight,
    Plus,
    Flag,
    MessageSquare,
    UserPlus,
    Pencil,
    Trash2,
    Circle,
  } from "lucide-react";
  
  import UserAvatar from "../users/UserAvatar";
  import {
    relativeTime,
    fullTime,
  } from "../../utils/collaborationUtils";
  
  const ICON_MAP = {
    move: {
      Icon: ArrowRight,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
    },
  
    create: {
      Icon: Plus,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  
    priority: {
      Icon: Flag,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  
    comment: {
      Icon: MessageSquare,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
  
    join: {
      Icon: UserPlus,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  
    edit: {
      Icon: Pencil,
      color: "text-zinc-400",
      bg: "bg-zinc-400/10",
    },
  
    delete: {
      Icon: Trash2,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  };
  
  export default function ActivityItem({
    activity,
    isLast,
  }) {
    const iconCfg =
      ICON_MAP[activity?.icon] || {
        Icon: Circle,
        color: "text-zinc-500",
        bg: "bg-zinc-500/10",
      };
  
    const { Icon } = iconCfg;
  
    const user = activity?.user || {
      name: "Someone",
      email: "unknown@example.com",
    };
  
    return (
      <div className="flex gap-3 relative">
        {/* Connector line */}
        {!isLast && (
          <div
            className="
              absolute left-[15px] top-8 bottom-0
              w-px bg-zinc-800
            "
          />
        )}
  
        {/* Icon bubble */}
        <div
          className={`
            relative z-10
            w-8 h-8 rounded-xl
            flex items-center justify-center flex-shrink-0
            border border-zinc-800
            ${iconCfg.bg}
          `}
        >
          <Icon
            size={13}
            className={iconCfg.color}
          />
        </div>
  
        {/* Content */}
        <div className="flex-1 min-w-0 pb-5">
          <div className="flex items-start gap-2">
            <UserAvatar
              user={user}
              size="xs"
              showTooltip
              className="mt-0.5 flex-shrink-0"
            />
  
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-300 leading-relaxed break-words">
                <span className="font-semibold text-zinc-200">
                  {user.name}
                </span>{" "}
  
                <span className="text-zinc-400">
                  {activity?.action || "updated something"}
                </span>
  
                {activity?.target && (
                  <>
                    {" "}
                    <span className="font-medium text-zinc-200">
                      "{activity.target}"
                    </span>
                  </>
                )}
  
                {activity?.detail && (
                  <span
                    className="
                      ml-1 inline-flex items-center
                      px-1.5 py-0.5 rounded-md
                      bg-zinc-800 border border-zinc-700
                      text-[10px] text-zinc-400 font-medium
                    "
                  >
                    {activity.detail}
                  </span>
                )}
              </p>
  
              <p
                className="text-[10px] text-zinc-600 mt-1"
                title={fullTime(activity?.createdAt)}
              >
                {relativeTime(activity?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }