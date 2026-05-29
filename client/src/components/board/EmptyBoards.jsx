// components/board/EmptyBoards.jsx
// Shown when the user has no boards yet.
// Has a CTA button to open the create modal.

import { LayoutDashboard, Plus } from "lucide-react";

/**
 * @param {Function} onCreateClick - Opens the CreateBoardModal
 */
export default function EmptyBoards({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Icon container */}
      <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700
                      flex items-center justify-center mb-6">
        <LayoutDashboard size={36} className="text-gray-600" />
      </div>

      <h3 className="text-white text-xl font-semibold mb-2">
        No boards yet
      </h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        Boards help you organize your tasks. Create your first one to get started.
      </p>

      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500
                   text-white text-sm font-medium rounded-lg transition-colors duration-150"
      >
        <Plus size={16} />
        Create your first board
      </button>
    </div>
  );
}
