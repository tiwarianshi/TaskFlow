import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { MOCK_MEMBERS } from "../utils/collaborationUtils";

// Backend-ready structure.
// Replace mock logic later with real API calls.

export function useBoardMembers(boardId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch members ─────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!boardId) return;

    setLoading(true);

    try {
      // Future backend:
      // const { data } = await axiosInstance.get(`/boards/${boardId}/members`);

      await new Promise((r) => setTimeout(r, 400));

      const sorted = [...MOCK_MEMBERS].sort((a, b) => {
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
      const normalizedEmail = email.trim().toLowerCase();

      const alreadyExists = members.some(
        (m) => m.email?.toLowerCase() === normalizedEmail
      );

      if (alreadyExists) {
        toast.error("Member already exists");
        return;
      }

      // Future backend:
      // const { data } = await axiosInstance.post(
      //   `/boards/${boardId}/members/invite`,
      //   { email: normalizedEmail, role }
      // );

      const newMember = {
        _id: `u_${Date.now()}`,
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role,
        avatar: null,
      };

      setMembers((prev) => [...prev, newMember]);

      return newMember;
    },
    [members]
  );

  // ── Remove member ────────────────────────────────────
  const removeMember = useCallback(
    async (userId) => {
      const previous = members;

      setMembers((prev) => prev.filter((m) => m._id !== userId));

      try {
        // Future backend:
        // await axiosInstance.delete(
        //   `/boards/${boardId}/members/${userId}`
        // );
      } catch {
        setMembers(previous);
        toast.error("Failed to remove member");
      }
    },
    [members]
  );

  return {
    members,
    loading,
    inviteMember,
    removeMember,
    refetch: fetchMembers,
  };
}