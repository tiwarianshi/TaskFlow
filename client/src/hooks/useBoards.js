import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import {
  getBoards,
  createBoard,
  deleteBoard,
  updateBoard,
  toggleFavoriteBoard,
} from "../api/boardApi";

// ─── Recent boards via localStorage (5 max, sorted by last access) ───────────
const RECENT_KEY = "taskflow_recent_boards";
const MAX_RECENT = 5;

function getStoredRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function pushRecent(board) {
  const prev = getStoredRecent().filter((b) => b._id !== board._id);
  const next = [{ ...board, _accessedAt: Date.now() }, ...prev].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

// ─── Main hook ───────────────────────────────────────────────────────────────
export function useBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBoards, setRecentBoards] = useState(getStoredRecent);

  // Search + filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "favorites" | "recent"
  const debounceTimer = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // ── Debounced search ─────────────────────────────────────────────────────
  function handleSearchChange(value) {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setSearchQuery(value), 200);
  }

  // ── Derived: filtered boards ─────────────────────────────────────────────
  const filteredBoards = useMemo(() => {
    let list = [...boards];

    // Filter tab
    if (activeFilter === "favorites") {
      list = list.filter((b) => b.isFavorite);
    } else if (activeFilter === "recent") {
      const recentIds = recentBoards.map((r) => r._id);
      list = list
        .filter((b) => recentIds.includes(b._id))
        .sort(
          (a, b) =>
            recentIds.indexOf(a._id) - recentIds.indexOf(b._id)
        );
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [boards, activeFilter, searchQuery, recentBoards]);

  // ── Recent boards merged with full board data ────────────────────────────
  const enrichedRecentBoards = useMemo(() => {
    return recentBoards
      .map((r) => boards.find((b) => b._id === r._id) || r)
      .slice(0, MAX_RECENT);
  }, [recentBoards, boards]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleCreateBoard = useCallback(async (boardData) => {
    const newBoard = await createBoard(boardData);
    setBoards((prev) => [newBoard, ...prev]);
    return newBoard;
  }, []);

  const handleDeleteBoard = useCallback(async (boardId) => {
    // Optimistic
    setBoards((prev) => prev.filter((b) => b._id !== boardId));
    try {
      await deleteBoard(boardId);
      // Remove from recents if present
      setRecentBoards((prev) => {
        const next = prev.filter((b) => b._id !== boardId);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      fetchBoards(); // revert
      toast.error("Failed to delete board");
    }
  }, [fetchBoards]);

  const handleToggleFavorite = useCallback(async (boardId, currentValue) => {
    const newValue = !currentValue;
    // Optimistic
    setBoards((prev) =>
      prev.map((b) =>
        b._id === boardId ? { ...b, isFavorite: newValue } : b
      )
    );
    try {
      await toggleFavoriteBoard(boardId, newValue);
    } catch {
      // Revert
      setBoards((prev) =>
        prev.map((b) =>
          b._id === boardId ? { ...b, isFavorite: currentValue } : b
        )
      );
      toast.error("Failed to update favorite");
    }
  }, []);

  const handleBoardOpened = useCallback((board) => {
    const next = pushRecent(board);
    setRecentBoards(next);
  }, []);

  const handleUpdateBoard = useCallback(async (boardId, updates) => {
    // Optimistic
    setBoards((prev) =>
      prev.map((b) => (b._id === boardId ? { ...b, ...updates } : b))
    );
    try {
      const updated = await updateBoard(boardId, updates);
      setBoards((prev) =>
        prev.map((b) => (b._id === boardId ? updated : b))
      );
    } catch {
      fetchBoards();
      toast.error("Failed to update board");
    }
  }, [fetchBoards]);

  return {
    // State
    boards,
    filteredBoards,
    recentBoards: enrichedRecentBoards,
    loading,
    error,
    searchQuery,
    activeFilter,
    // Setters
    setActiveFilter,
    handleSearchChange,
    // Actions
    fetchBoards,
    handleCreateBoard,
    handleDeleteBoard,
    handleToggleFavorite,
    handleBoardOpened,
    handleUpdateBoard,
  };
}
