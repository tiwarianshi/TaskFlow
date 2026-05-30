import { useNavigate } from "react-router-dom";
import { Trash2, Star, KanbanSquare } from "lucide-react";

import BoardStats from "./BoardStats";

// ─── Gradient map ────────────────────────────────────────────────────────────
const COLOR_GRADIENTS = {
  "#6d28d9": "from-violet-600 to-violet-800",
  "#0ea5e9": "from-sky-500 to-sky-700",
  "#10b981": "from-emerald-500 to-emerald-700",
  "#f59e0b": "from-amber-500 to-amber-700",
  "#ef4444": "from-red-500 to-red-700",
  "#ec4899": "from-pink-500 to-pink-700",
  "#f97316": "from-orange-500 to-orange-700",
  "#14b8a6": "from-teal-500 to-teal-700",
};

function getGradient(color) {
  return COLOR_GRADIENTS[color] || "from-violet-600 to-violet-800";
}

function formatDate(dateStr) {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function BoardCard({
  board,
  onDelete,
  onToggleFavorite,
  onOpen,
  stats,
  statsLoading,
}) {
  const navigate = useNavigate();

  const boardColor = board.color || "#6d28d9";
  const gradient = getGradient(boardColor);

  // ─── Navigation ───────────────────────────────────────────────────────────
  function handleCardClick() {
    onOpen?.(board);
    navigate(`/board/${board._id}`);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  function handleDelete(e) {
    e.stopPropagation();
    onDelete?.(board._id);
  }

  // ─── Favorite toggle ──────────────────────────────────────────────────────
  function handleFavorite(e) {
    e.stopPropagation();
    onToggleFavorite?.(board._id, board.isFavorite);
  }

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleCardClick();
        }
      }}
      className="
        group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
        bg-zinc-900 border border-zinc-800
        hover:border-zinc-700 hover:-translate-y-1
        hover:shadow-xl hover:shadow-black/30
        transition-all duration-200 select-none
        focus:outline-none focus:ring-2 focus:ring-violet-500/40
      "
    >
      {/* ── Top accent strip ── */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${gradient} flex-shrink-0`}
      />

      {/* ── Card content ── */}
      <div className="flex flex-col flex-1 p-4">

        {/* Header */}
        <div className="flex items-start gap-3">

          {/* Board icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: `${boardColor}22`,
            }}
          >
            <KanbanSquare
              size={16}
              style={{ color: boardColor }}
            />
          </div>

          {/* Title + description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 truncate leading-tight">
              {board.title}
            </h3>

            {board.description && (
              <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                {board.description}
              </p>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`
              flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
              transition-all duration-150
              ${
                board.isFavorite
                  ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
                  : "text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100"
              }
            `}
            aria-label={
              board.isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Star
              size={13}
              fill={board.isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 flex-1">
          {statsLoading ? (
            <div className="space-y-1.5">
              <div className="h-2 w-3/4 bg-zinc-800 rounded-full animate-pulse" />
              <div className="h-1.5 w-full bg-zinc-800 rounded-full animate-pulse" />
            </div>
          ) : (
            <BoardStats
              stats={stats || {}}
              color={boardColor}
              compact
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-800">

          {/* Date */}
          <span className="text-[11px] text-zinc-600">
            {formatDate(board.updatedAt || board.createdAt)}
          </span>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="
              w-6 h-6 rounded-md flex items-center justify-center
              text-zinc-700 hover:text-red-400 hover:bg-red-400/10
              opacity-0 group-hover:opacity-100
              transition-all duration-150
            "
            aria-label="Delete board"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}