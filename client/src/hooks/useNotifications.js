import { useEffect, useState, useCallback, useRef } from "react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationApi";

const DEFAULT_POLLING_INTERVAL = 30000;

function getErrorMessage(error) {
  return (
    error?.response?.data?.message || error?.message || "Failed to load notifications"
  );
}

export function useNotifications({
  page: initialPage = 1,
  limit: initialLimit = 20,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  pollUnreadCount = true,
} = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const pollingRef = useRef(null);

  const fetchNotifications = useCallback(
    async (fetchPage = page, fetchLimit = limit) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getNotifications(fetchPage, fetchLimit);
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch (err) {
      console.error("Failed to refresh unread count:", err);
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      const previousNotifications = notifications;
      const previousUnreadCount = unreadCount;
      const alreadyRead = notifications.some(
        (notification) => notification._id === notificationId && notification.isRead
      );

      if (alreadyRead) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await markNotificationRead(notificationId);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        setError(getErrorMessage(err));
      }
    },
    [notifications, unreadCount]
  );

  const markAllAsRead = useCallback(async () => {
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(getErrorMessage(err));
    }
  }, [notifications, unreadCount]);

  useEffect(() => {
    fetchNotifications(page, limit);
  }, [fetchNotifications, page, limit]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!pollUnreadCount || pollingInterval <= 0) return;

    pollingRef.current = window.setInterval(() => {
      fetchUnreadCount();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchUnreadCount, pollingInterval, pollUnreadCount]);

  const refetch = useCallback(() => {
    fetchNotifications(page, limit);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount, page, limit]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    page,
    limit,
    setPage,
    setLimit,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}

export default useNotifications;
