import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";

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
      const { data } = await api.get(`/boards/${boardId}/activity`);

      setActivity(data);
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