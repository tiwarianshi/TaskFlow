//
// collaborationUtils.js
//

// ─────────────────────────────────────────────────────────
// Avatar Colors
// ─────────────────────────────────────────────────────────

const AVATAR_HUES = [
    { bg: "bg-violet-500",  text: "text-white", hex: "#8b5cf6" },
    { bg: "bg-sky-500",     text: "text-white", hex: "#0ea5e9" },
    { bg: "bg-emerald-500", text: "text-white", hex: "#10b981" },
    { bg: "bg-amber-500",   text: "text-white", hex: "#f59e0b" },
    { bg: "bg-rose-500",    text: "text-white", hex: "#f43f5e" },
    { bg: "bg-pink-500",    text: "text-white", hex: "#ec4899" },
    { bg: "bg-orange-500",  text: "text-white", hex: "#f97316" },
    { bg: "bg-teal-500",    text: "text-white", hex: "#14b8a6" },
    { bg: "bg-indigo-500",  text: "text-white", hex: "#6366f1" },
    { bg: "bg-cyan-500",    text: "text-white", hex: "#06b6d4" },
  ];
  
  function hashString(str = "") {
    let hash = 0;
  
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
  
    return Math.abs(hash);
  }
  
  export function getAvatarColor(name = "") {
    return AVATAR_HUES[
      hashString(name) % AVATAR_HUES.length
    ];
  }
  
  export function getInitials(name = "") {
    if (!name?.trim()) return "?";
  
    const parts = name.trim().split(/\s+/);
  
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }
  
  // ─────────────────────────────────────────────────────────
  // Roles
  // ─────────────────────────────────────────────────────────
  
  export const ROLE_CONFIG = {
    owner: {
      label: "Owner",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
  
    admin: {
      label: "Admin",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
    },
  
    member: {
      label: "Member",
      color: "text-zinc-400",
      bg: "bg-zinc-400/10",
      border: "border-zinc-600/30",
    },
  };
  
  export const ROLES = ["admin", "member"];
  
  // ─────────────────────────────────────────────────────────
  // Date Helpers
  // ─────────────────────────────────────────────────────────
  
  function safeDate(dateStr) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  
  export function relativeTime(dateStr) {
    const date = safeDate(dateStr);
  
    if (!date) return "";
  
    const diff = Date.now() - date.getTime();
  
    const sec = Math.floor(diff / 1000);
  
    if (sec < 10) return "just now";
    if (sec < 60) return `${sec}s ago`;
  
    const min = Math.floor(sec / 60);
  
    if (min < 60) return `${min}m ago`;
  
    const hr = Math.floor(min / 60);
  
    if (hr < 24) return `${hr}h ago`;
  
    const day = Math.floor(hr / 24);
  
    if (day < 7) return `${day}d ago`;
  
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  
  export function fullTime(dateStr) {
    const date = safeDate(dateStr);
  
    if (!date) return "";
  
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  
  export function dayLabel(dateStr) {
    const date = safeDate(dateStr);
  
    if (!date) return "";
  
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const diffDays = Math.round(
      (today - target) / 86400000
    );
  
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
  
    return target.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }
  
  export function groupByDay(items = [], dateKey = "createdAt") {
    const groups = {};
  
    items.forEach((item) => {
      const date = safeDate(item?.[dateKey]);
  
      if (!date) return;
  
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
  
      const key = normalized.toISOString();
  
      if (!groups[key]) {
        groups[key] = [];
      }
  
      groups[key].push(item);
    });
  
    return Object.entries(groups)
      .sort(
        ([a], [b]) =>
          new Date(b).getTime() - new Date(a).getTime()
      )
      .map(([day, items]) => ({
        day,
        label: dayLabel(day),
        items: items.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        ),
      }));
  }
  
  // ─────────────────────────────────────────────────────────
  // Mock Members
  // ─────────────────────────────────────────────────────────
  
  export const MOCK_MEMBERS = [
    {
      _id: "u1",
      name: "Anshi Gupta",
      email: "anshi@example.com",
      role: "owner",
      avatar: null,
    },
  
    {
      _id: "u2",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "admin",
      avatar: null,
    },
  
    {
      _id: "u3",
      name: "Priya Singh",
      email: "priya@example.com",
      role: "member",
      avatar: null,
    },
  
    {
      _id: "u4",
      name: "Dev Kapoor",
      email: "dev@example.com",
      role: "member",
      avatar: null,
    },
  ];
  
  // ─────────────────────────────────────────────────────────
  // Mock Activity
  // ─────────────────────────────────────────────────────────
  
  export const MOCK_ACTIVITY = [
    {
      _id: "a1",
      boardId: "demo-board",
      user: MOCK_MEMBERS[0],
      action: "moved",
      target: "Fix login bug",
      detail: "In Progress → Done",
      icon: "move",
      createdAt: new Date(
        Date.now() - 5 * 60000
      ).toISOString(),
    },
  
    {
      _id: "a2",
      boardId: "demo-board",
      user: MOCK_MEMBERS[1],
      action: "created",
      target: "API rate limiting",
      icon: "create",
      createdAt: new Date(
        Date.now() - 22 * 60000
      ).toISOString(),
    },
  
    {
      _id: "a3",
      boardId: "demo-board",
      user: MOCK_MEMBERS[0],
      action: "changed priority",
      target: "Deploy v2",
      detail: "Medium → Urgent",
      icon: "priority",
      createdAt: new Date(
        Date.now() - 2 * 3600000
      ).toISOString(),
    },
  
    {
      _id: "a4",
      boardId: "demo-board",
      user: MOCK_MEMBERS[2],
      action: "commented on",
      target: "Setup CI/CD",
      icon: "comment",
      createdAt: new Date(
        Date.now() - 5 * 3600000
      ).toISOString(),
    },
  ];
  
  // ─────────────────────────────────────────────────────────
  // Mock Comments
  // ─────────────────────────────────────────────────────────
  
  export const MOCK_COMMENTS = [
    {
      _id: "c1",
      taskId: "demo-task",
      user: MOCK_MEMBERS[1],
      body:
        "This is almost ready, just needs one more review pass.",
      createdAt: new Date(
        Date.now() - 2 * 3600000
      ).toISOString(),
    },
  
    {
      _id: "c2",
      taskId: "demo-task",
      user: MOCK_MEMBERS[2],
      body:
        "Left some inline comments in the PR — nothing blocking.",
      createdAt: new Date(
        Date.now() - 3600000
      ).toISOString(),
    },
  ];