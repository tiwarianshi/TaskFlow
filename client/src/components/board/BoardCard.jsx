// components/board/BoardCard.jsx
// Displays a single board as a clickable card.
// Receives board data and a delete handler as props.

import { useNavigate } from "react-router-dom";
import { Trash2, Layout, Calendar } from "lucide-react";

// Color options for board accent strips — index maps to board.color (0–5)
const BOARD_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-cyan-600",
  "from-purple-500 to-fuchsia-600",
];

export default function BoardCard({ board, onDelete }) {
  const navigate = useNavigate();

  // Pick gradient based on stored color index
  const gradient = BOARD_COLORS[board.color ?? 0];

  // Safe date formatting
  const formattedDate = board.createdAt
    ? new Date(board.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  // Prevent delete button from triggering navigation
  function handleDeleteClick(e) {
    e.stopPropagation();
    onDelete(board._id);
  }

  return (
    <div
      onClick={() => navigate(`/boards/${board._id}`)}
      className="group relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden cursor-pointer
                 hover:border-gray-500 hover:shadow-xl hover:shadow-black/30
                 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Top gradient strip */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${gradient}
                         flex items-center justify-center`}
            >
              <Layout size={16} className="text-white" />
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-base truncate leading-tight">
              {board.title}
            </h3>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                       text-gray-500 hover:text-red-400 hover:bg-red-400/10
                       transition-all duration-150"
            title="Delete board"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Description */}
        {board.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {board.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 pt-3 border-t border-gray-700/60">
          <Calendar size={12} />
          <span>Created {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}