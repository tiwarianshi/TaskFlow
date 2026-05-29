// components/board/BoardGrid.jsx
// Renders the responsive grid of BoardCard components.
// Separated from BoardsPage so the grid logic stays isolated and reusable.

import BoardCard from "./BoardCard";

/**
 * @param {Array}    boards   - Array of board objects from the API
 * @param {Function} onDelete - Called with boardId when delete is clicked
 */
export default function BoardGrid({ boards, onDelete }) {
  return (
    // Responsive grid:
    // - 1 column on mobile
    // - 2 columns on medium screens
    // - 3 columns on large screens
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {boards.map((board) => (
        <BoardCard
          key={board._id}   // React needs a unique key for list items
          board={board}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
