import { useState } from "react";
import { Trash2 } from "lucide-react";
import UserAvatar from "../users/UserAvatar";
import {
  relativeTime,
  fullTime,
} from "../../utils/collaborationUtils";

export default function CommentItem({
  comment,
  onDelete,
  canDelete,
}) {
  const [hovering, setHovering] = useState(false);

  const user = comment?.user || {
    name: "Unknown User",
    email: "unknown@example.com",
  };

  return (
    <div
      className="flex gap-2.5 group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Avatar */}
      <UserAvatar
        user={user}
        size="sm"
        className="mt-0.5 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-semibold text-zinc-200">
            {user.name}
          </span>

          <span
            className="text-[10px] text-zinc-600"
            title={fullTime(comment.createdAt)}
          >
            {relativeTime(comment.createdAt)}
          </span>

          {comment.optimistic && (
            <span className="text-[9px] text-zinc-600 italic">
              sending…
            </span>
          )}
        </div>

        {/* Comment body */}
        <div className="relative">
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
            {comment.body}
          </p>

          {/* Delete button */}
          {canDelete && hovering && !comment.optimistic && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(comment._id);
              }}
              className="
                absolute -top-1 -right-1
                w-5 h-5 rounded-md
                flex items-center justify-center
                bg-zinc-800 border border-zinc-700
                text-zinc-500
                hover:text-red-400
                hover:border-red-500/30
                transition-all
              "
            >
              <Trash2 size={9} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}