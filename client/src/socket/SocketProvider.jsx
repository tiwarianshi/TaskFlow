import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { createSocket, disconnectSocket, getSocket, safeOn, safeOff } from "./socket.js";

export const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Establish socket when token exists; disconnect when token is removed
  useEffect(() => {
    // Manage socket lifecycle tied to auth token
    if (!token) {
      // no token -> ensure full cleanup
      disconnectSocket();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    // create singleton socket and store ref
    const sock = createSocket(token);
    socketRef.current = sock;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleError = (err) => console.warn('[SocketProvider] socket error', err && err.message);

    // Use safeOn/safeOff to prevent duplicate handlers
    safeOn('connect', handleConnect);
    safeOn('disconnect', handleDisconnect);
    safeOn('connect_error', handleError);

    return () => {
      safeOff('connect', handleConnect);
      safeOff('disconnect', handleDisconnect);
      safeOff('connect_error', handleError);
      // Keep socket alive for session; disconnect only when token removed or on full unmount
    };
  }, [token]);

  // Helper: join a board room
  function joinBoard(boardId) {
    if (!boardId) return;
    const sock = getSocket();
    if (!sock) return;

    // emit join request; server will confirm via joined-board event if needed
    try {
      sock.emit('join-board', { boardId });
    } catch (err) {
      console.warn('[SocketProvider] joinBoard emit failed', err && err.message);
    }
  }

  function leaveBoard(boardId) {
    if (!boardId) return;
    const sock = getSocket();
    if (!sock) return;
    try {
      sock.emit('leave-board', { boardId });
    } catch (err) {
      console.warn('[SocketProvider] leaveBoard emit failed', err && err.message);
    }
  }

  const value = useMemo(() => ({
    // expose only stable helpers and a lightweight connected flag to avoid re-renders
    connected,
    joinBoard,
    leaveBoard,
    socket: () => getSocket(),
  }), [connected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
