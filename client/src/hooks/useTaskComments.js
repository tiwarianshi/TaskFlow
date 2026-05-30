import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { MOCK_COMMENTS } from "../utils/collaborationUtils";

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
      // Future backend:
      // const { data } = await axiosInstance.get(
      //   `/tasks/${taskId}/comments`
      // );

      await new Promise((r) => setTimeout(r, 300));

      // Mock task-specific filtering
      const filtered = MOCK_COMMENTS.filter(
        (c) => c.taskId === taskId || !c.taskId
      );

      const sorted = [...filtered].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setComments(sorted);
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
        // Future backend:
        // const { data } = await axiosInstance.post(
        //   `/tasks/${taskId}/comments`,
        //   { body: trimmed }
        // );

        // Mock successful server response
        await new Promise((r) => setTimeout(r, 500));

        const realComment = {
          ...optimisticComment,
          optimistic: false,
          _id: `c_${Date.now()}`,
        };

        setComments((prev) =>
          prev.map((c) =>
            c._id === optimisticComment._id ? realComment : c
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
        // Future backend:
        // await axiosInstance.delete(
        //   `/tasks/${taskId}/comments/${commentId}`
        // );

        await new Promise((r) => setTimeout(r, 250));
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