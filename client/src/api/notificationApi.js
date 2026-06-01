import axiosInstance from "./axiosInstance";

/**
 * Notification API endpoints
 * Base: /api/notifications
 */

export async function getNotifications(page = 1, limit = 20) {
  const { data } = await axiosInstance.get("/notifications", {
    params: { page, limit },
  });
  return data;
}

export async function getUnreadCount() {
  const { data } = await axiosInstance.get("/notifications/unread-count");
  return data?.count ?? 0;
}

export async function markNotificationRead(notificationId) {
  const { data } = await axiosInstance.patch(
    `/notifications/${notificationId}/read`
  );
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await axiosInstance.patch("/notifications/read-all");
  return data;
}
