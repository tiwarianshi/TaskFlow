import { useNavigate } from "react-router-dom";
import { Clock, KanbanSquare } from "lucide-react";

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentBoards({ boards, onOpen }) {
  const navigate = useNavigate();

  if (!boards || boards.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={13} className="text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Recently Opened
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {boards.map((board) => (
          <button
            key={board._id}
            onClick={() => {
              onOpen?.(board);
              navigate(`/board/${board._id}`);
            }}
            className="
              flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl
              bg-zinc-800/60 border border-zinc-700/50 text-left
              hover:bg-zinc-800 hover:border-zinc-600
              transition-all duration-150 group min-w-0 max-w-[180px]
            "
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${board.color || "#6d28d9"}22` }}
            >
              <KanbanSquare
                size={13}
                style={{ color: board.color || "#6d28d9" }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                {board.title}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {timeAgo(board._accessedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
