// pages/BoardsPage.jsx
// Main page for listing, creating, and deleting boards.
// Uses Sidebar + Topbar from the existing dashboard shell.

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import BoardGrid from "../components/board/BoardGrid";
import EmptyBoards from "../components/board/EmptyBoards";
import CreateBoardModal from "../components/board/CreateBoardModal";
import { getBoards, createBoard, deleteBoard } from "../api/boardApi";

export default function BoardsPage() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [boards, setBoards]           = useState([]);       // all boards from API
  const [isLoading, setIsLoading]     = useState(true);     // initial fetch spinner
  const [isCreating, setIsCreating]   = useState(false);    // modal submit spinner
  const [modalOpen, setModalOpen]     = useState(false);    // create modal visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);    // mobile sidebar toggle

  // ─── Fetch boards on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchBoards();
  }, []); // empty array = run once when page loads

  async function fetchBoards() {
    try {
      setIsLoading(true);
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load boards.");
    } finally {
      setIsLoading(false); // always stop spinner, even on error
    }
  }

  // ─── Create board ─────────────────────────────────────────────────────────
  async function handleCreateBoard(formData) {
    try {
      setIsCreating(true);
      const newBoard = await createBoard(formData);

      // Add the new board to the top of the list without re-fetching
      setBoards((prev) => [newBoard, ...prev]);

      setModalOpen(false);
      toast.success(`"${newBoard.title}" board created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create board.");
    } finally {
      setIsCreating(false);
    }
  }

  // ─── Delete board ─────────────────────────────────────────────────────────
  async function handleDeleteBoard(boardId) {
    // Find board before removing
    const boardToDelete = boards.find((b) => b._id === boardId);
  
    // Save current state for rollback
    const previousBoards = boards;
  
    // Optimistic UI update
    setBoards((prev) => prev.filter((b) => b._id !== boardId));
  
    try {
      await deleteBoard(boardId);
      toast.success(`"${boardToDelete?.title}" deleted.`);
    } catch (err) {
      // Restore previous state if API fails
      setBoards(previousBoards);
  
      toast.error(
        err.response?.data?.message || "Failed to delete board."
      );
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* ── Scrollable page body ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Boards</h1>
              <p className="text-gray-400 text-sm mt-1">
                {boards.length > 0
                  ? `${boards.length} board${boards.length !== 1 ? "s" : ""}`
                  : "Organize your work into boards"}
              </p>
            </div>

            {/* New board button — only show when boards exist */}
            {boards.length > 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
                           text-white text-sm font-medium rounded-lg
                           transition-colors duration-150"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New board</span>
                <span className="sm:hidden">New</span>
              </button>
            )}
          </div>

          {/* ── Content: loading / empty / grid ── */}
          {isLoading ? (
            // Full-area loading spinner
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={32} className="animate-spin text-indigo-400" />
                <p className="text-gray-500 text-sm">Loading your boards...</p>
              </div>
            </div>
          ) : boards.length === 0 ? (
            // Empty state with CTA
            <EmptyBoards onCreateClick={() => setModalOpen(true)} />
          ) : (
            // Board cards grid
            <BoardGrid boards={boards} onDelete={handleDeleteBoard} />
          )}
        </main>
      </div>

      {/* ── Create Board Modal ── */}
      <CreateBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateBoard}
        isLoading={isCreating}
      />
    </div>
  );
}
