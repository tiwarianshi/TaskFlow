import { useState, useEffect, useMemo } from "react";
import { Plus, KanbanSquare, SearchX } from "lucide-react";
import toast from "react-hot-toast";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import BoardCard from "../components/board/BoardCard";
import BoardSearch from "../components/board/BoardSearch";
import BoardFilters from "../components/board/BoardFilters";
import BoardSkeleton from "../components/board/BoardSkeleton";
import RecentBoards from "../components/board/RecentBoards";
import CreateBoardModal from "../components/board/CreateBoardModal";
import { useBoards } from "../hooks/useBoards";
import { getBoardStats } from "../api/boardApi";

export default function BoardsPage() {
  const {
    boards,
    filteredBoards,
    recentBoards,
    loading,
    error,
    searchQuery,
    activeFilter,
    setActiveFilter,
    handleSearchChange,
    fetchBoards,
    handleCreateBoard,
    handleDeleteBoard,
    handleToggleFavorite,
    handleBoardOpened,
  } = useBoards();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ─── Stats per board ──────────────────────────────────────────────────────
  // Lazy-load stats for each board independently
  const [statsMap, setStatsMap] = useState({}); // { boardId: { total, completed } }
  const [statsLoadingIds, setStatsLoadingIds] = useState(new Set());

  useEffect(() => {
    if (!boards.length) return;
    const pending = boards.filter((b) => !statsMap[b._id]);
    if (!pending.length) return;

    pending.forEach(async (board) => {
      setStatsLoadingIds((prev) => new Set([...prev, board._id]));
      try {
        const stats = await getBoardStats(board._id);
        setStatsMap((prev) => ({ ...prev, [board._id]: stats }));
      } catch {
        // Stats are best-effort — silently skip if endpoint not ready
        setStatsMap((prev) => ({
          ...prev,
          [board._id]: { total: 0, completed: 0 },
        }));
      } finally {
        setStatsLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(board._id);
          return next;
        });
      }
    });
  }, [boards]);

  // ─── Filter counts for the tab badges ────────────────────────────────────
  const filterCounts = useMemo(() => ({
    all: boards.length,
    favorites: boards.filter((b) => b.isFavorite).length,
    recent: recentBoards.length,
  }), [boards, recentBoards]);

  // ─── Create handler with toast ────────────────────────────────────────────
  async function handleCreate(boardData) {
    try {
      await handleCreateBoard(boardData);
      toast.success("Board created");
    } catch {
      toast.error("Failed to create board");
      throw new Error("Create failed"); // let modal stay open
    }
  }

  async function handleDelete(boardId) {
    const board = boards.find((b) => b._id === boardId);
    await handleDeleteBoard(boardId);
    toast.success(`"${board?.title}" deleted`);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 relative z-0">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2.5">
                <KanbanSquare size={20} className="text-violet-400" />
                Boards
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {boards.length} board{boards.length !== 1 ? "s" : ""} total
              </p>
            </div>

            <button
             type="button"
             onClick={() => setShowCreateModal(true)}
             className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-600/20"
             >
              <Plus size={15} />
              <span className="hidden sm:inline">New Board</span>
            </button>
          </div>

          {/* Recent boards — only shown when filter is "all" and no search */}
          {activeFilter === "all" && !searchQuery && (
            <RecentBoards boards={recentBoards} onOpen={handleBoardOpened} />
          )}

          {/* Search + filters toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <BoardSearch onSearch={handleSearchChange} />
            <BoardFilters
              active={activeFilter}
              onChange={setActiveFilter}
              counts={filterCounts}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={fetchBoards}
                className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <BoardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty: no boards at all */}
          {!loading && !error && boards.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center">
                <KanbanSquare size={24} className="text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">No boards yet</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Create your first board to get started
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                <Plus size={14} /> Create Board
              </button>
            </div>
          )}

          {/* Empty: search / filter returned nothing */}
          {!loading && !error && boards.length > 0 && filteredBoards.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <SearchX size={32} className="text-zinc-700" />
              <p className="text-sm font-medium text-zinc-400">
                {searchQuery
                  ? `No boards match "${searchQuery}"`
                  : activeFilter === "favorites"
                  ? "No favorite boards yet"
                  : "No recent boards"}
              </p>
              <p className="text-xs text-zinc-600">
                {searchQuery
                  ? "Try a different search term"
                  : activeFilter === "favorites"
                  ? "Star a board to add it here"
                  : "Open a board to see it here"}
              </p>
            </div>
          )}

          {/* Board grid */}
          {!loading && !error && filteredBoards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBoards.map((board) => (
                <BoardCard
                  key={board._id}
                  board={board}
                  stats={statsMap[board._id]}
                  statsLoading={statsLoadingIds.has(board._id)}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onOpen={handleBoardOpened}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
  <CreateBoardModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onCreate={handleCreate}
  />
)}
    </div>
  );
}
