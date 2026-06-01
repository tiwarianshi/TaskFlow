import { CheckCheck, AlertCircle } from "lucide-react";
import NotificationItem from "./NotificationItem";

/**
 * NotificationDropdown
 *
 * Displays a dropdown panel with:
 * - List of notifications
 * - Loading state
 * - Empty state
 * - Error state
 * - "Mark all as read" button
 *
 * Props:
 *   isOpen — whether the dropdown is visible
 *   onClose — called when user wants to close dropdown
 *   notifications — array of notification objects
 *   loading — loading state
 *   error — error message if any
 *   unreadCount — number of unread notifications
 *   onMarkAsRead — callback when user marks notification as read
 *   onMarkAllAsRead — callback when user clicks "Mark all as read"
 */
export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications = [],
  loading,
  error,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown Panel */}
      <div
        className="
          absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-1rem)]
          bg-gray-900 border border-gray-700 rounded-xl shadow-2xl
          z-40 overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-200
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
              {unreadCount} new
            </span>
          )}
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Loading...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border-b border-gray-700">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">
                No new notifications
              </p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Mark all as read */}
        {!loading && notifications.length > 0 && unreadCount > 0 && (
          <div className="border-t border-gray-700 bg-gray-800 px-4 py-2">
            <button
              onClick={onMarkAllAsRead}
              className="
                w-full text-center text-sm font-medium
                text-gray-300 hover:text-white
                transition-colors duration-150
                py-2 rounded-lg hover:bg-gray-700
                flex items-center justify-center gap-2
              "
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}
