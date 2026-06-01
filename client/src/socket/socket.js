// Lightweight socket factory and lifecycle helpers
import { io } from "socket.io-client";

// Singleton socket instance
let socket = null;

// Track attached handlers to avoid duplicates and ease cleanup
const listenersMap = new Map(); // event -> Set(handler)

/**
 * Create and configure the Socket.IO client singleton.
 * Calling repeatedly returns the same instance.
 */
export function createSocket(token) {
  if (socket) return socket;

  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  socket = io(url, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Core lifecycle logging and safety handlers
  socket.on("connect", () => {
    console.debug("[socket] connect", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.debug("[socket] disconnect", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[socket] connect_error", err && err.message);
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.debug("[socket] reconnect_attempt", attempt);
  });

  socket.on("reconnect_failed", () => {
    console.error("[socket] reconnect_failed");
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    // remove tracked listeners
    listenersMap.forEach((set, event) => {
      set.forEach((handler) => socket.off(event, handler));
    });
    listenersMap.clear();
    socket.removeAllListeners();
    socket.disconnect();
  } catch (e) {
    console.warn("[socket] disconnect error", e && e.message);
  } finally {
    socket = null;
  }
}

// Safe subscribe helpers that prevent duplicate listeners across the app.
export function safeOn(event, handler) {
  if (!socket) return;
  let set = listenersMap.get(event);
  if (!set) {
    set = new Set();
    listenersMap.set(event, set);
  }
  if (set.has(handler)) return; // already attached
  socket.on(event, handler);
  set.add(handler);
}

export function safeOff(event, handler) {
  if (!socket) return;
  const set = listenersMap.get(event);
  if (!set) return;
  if (handler) {
    if (!set.has(handler)) return;
    socket.off(event, handler);
    set.delete(handler);
  } else {
    // remove all handlers for this event
    set.forEach((h) => socket.off(event, h));
    listenersMap.delete(event);
  }
}
