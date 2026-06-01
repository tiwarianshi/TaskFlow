import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import useNotifications from "../../hooks/useNotifications";

/**
 * NotificationBell
 *
 * The main notification bell icon for the topbar.
 *
 * Features:
 * - Bell icon with unread count badge
 * - Click to open/close dropdown
 * - Smooth animations
 * - Outside click to close
 * - Polling for new notifications
 *
 * Can be placed in the Topbar component.
 * No required props - manages all state internally.
 */
export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !bellRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={toggleDropdown}
        className="
          relative p-2 rounded-lg
          text-gray-400 hover:text-white hover:bg-gray-800
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:ring-offset-gray-900 focus:ring-blue-500
        "
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className="
              absolute top-1 right-1
              flex items-center justify-center
              w-5 h-5 text-xs font-bold
              bg-red-500 text-white rounded-full
              animate-pulse
            "
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div ref={dropdownRef}>
        <NotificationDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          notifications={notifications}
          loading={loading}
          error={error}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </div>
  );
}
