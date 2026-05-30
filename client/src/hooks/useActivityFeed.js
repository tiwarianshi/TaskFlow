import { useState, useEffect, useCallback } from "react";
import { MOCK_ACTIVITY } from "../utils/collaborationUtils";

// Backend-ready activity hook
//
// Expected endpoint:
// GET /api/boards/:boardId/activity

export function useActivityFeed(boardId) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch activity ───────────────────────────────────
  const fetchActivity = useCallback(async () => {
    if (!boardId) return;

    setLoading(true);

    try {
      // Future backend:
      // const { data } = await axiosInstance.get(
      //   `/boards/${boardId}/activity`
      // );

      await new Promise((r) => setTimeout(r, 350));

      // Mock board-specific filtering
      const filtered = MOCK_ACTIVITY.filter(
        (item) => item.boardId === boardId || !item.boardId
      );

      // Newest first
      const sorted = [...filtered].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setActivity(sorted);
    } catch (err) {
      // Activity feed is non-critical
      console.error("Activity feed failed:", err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // ── Optional helper for realtime updates later ──────
  const addActivity = useCallback((item) => {
    setActivity((prev) => [item, ...prev]);
  }, []);

  return {
    activity,
    loading,
    refetch: fetchActivity,
    addActivity,
    setActivity,
  };
}