import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";

export function useBoardMembers(boardId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch members ─────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!boardId) return;

    setLoading(true);

    try {
      const { data } = await api.get(`/boards/${boardId}/members`);

      const sorted = [...data].sort((a, b) => {
        const order = {
          owner: 0,
          admin: 1,
          member: 2,
        };

        return order[a.role] - order[b.role];
      });

      setMembers(sorted);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── Invite member ────────────────────────────────────
  const inviteMember = useCallback(
    async ({ email, role }) => {
      if (!boardId) {
        toast.error("Unable to invite member: missing board id");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const alreadyExists = members.some(
        (m) => m.email?.toLowerCase() === normalizedEmail
      );

      if (alreadyExists) {
        toast.error("Member already exists");
        return;
      }

      const invitePath = `/boards/${encodeURIComponent(boardId)}/members/invite`;
      if (import.meta.env.DEV) {
        console.debug("Invite member request", invitePath, { email: normalizedEmail, role });
      }

      try {
        const { data } = await api.post(invitePath, {
          email: normalizedEmail,
          role,
        });

        setMembers((prev) => [...prev, data]);
        return data;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send invite");
      }
    },
    [boardId, members]
  );

  // ── Remove member ────────────────────────────────────
  const removeMember = useCallback(
    async (userId) => {
      const previous = members;

      setMembers((prev) => prev.filter((m) => m._id !== userId));

      try {
        await api.delete(`/boards/${boardId}/members/${userId}`);
      } catch (error) {
        setMembers(previous);
        toast.error(error.response?.data?.message || "Failed to remove member");
      }
    },
    [boardId, members]
  );

  return {
    members,
    loading,
    inviteMember,
    removeMember,
    refetch: fetchMembers,
  };
}