import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";

// Backend-ready hook
// Expected endpoints:
//
// GET    /api/tasks/:taskId/comments
// POST   /api/tasks/:taskId/comments
// DELETE /api/tasks/:taskId/comments/:commentId

export function useTaskComments(taskId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  // ── Fetch comments ───────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);

    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`);

      setComments(data);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ── Post comment ─────────────────────────────────────
  const postComment = useCallback(
    async (body) => {
      const trimmed = body?.trim();

      if (!trimmed || posting) return;

      setPosting(true);

      const optimisticComment = {
        _id: `temp_${Date.now()}`,
        taskId,
        body: trimmed,
        createdAt: new Date().toISOString(),
        optimistic: true,
        user: {
          _id: "me",
          name: "You",
          email: "you@example.com",
          avatar: null,
        },
      };

      setComments((prev) => [...prev, optimisticComment]);

      try {
        const { data } = await api.post(`/tasks/${taskId}/comments`, {
          body: trimmed,
        });

        setComments((prev) =>
          prev.map((c) =>
            c._id === optimisticComment._id ? data : c
          )
        );
      } catch {
        setComments((prev) =>
          prev.filter((c) => c._id !== optimisticComment._id)
        );

        toast.error("Failed to post comment");
      } finally {
        setPosting(false);
      }
    },
    [taskId, posting]
  );

  // ── Delete comment ───────────────────────────────────
  const deleteComment = useCallback(
    async (commentId) => {
      const previous = comments;

      setComments((prev) =>
        prev.filter((c) => c._id !== commentId)
      );

      try {
        await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      } catch {
        setComments(previous);
        toast.error("Failed to delete comment");
      }
    },
    [comments, taskId]
  );

  return {
    comments,
    loading,
    posting,
    postComment,
    deleteComment,
    refetch: fetchComments,
  };
}