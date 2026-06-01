import { formatDistanceToNow } from "date-fns";
import UserAvatar from "../users/UserAvatar";

/**
 * NotificationItem
 *
 * Displays a single notification with:
 * - Sender avatar
 * - Title and message
 * - Relative time
 * - Unread indicator dot
 *
 * Props:
 *   notification — the notification object { _id, sender, title, message, isRead, createdAt, ... }
 *   onMarkAsRead — callback when user clicks the notification
 */
export default function NotificationItem({
  notification,
  onMarkAsRead,
}) {
  const {
    _id,
    sender,
    title,
    message,
    isRead,
    createdAt,
  } = notification;

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(_id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  // Extract sender name and avatar if sender is an object
  const senderName = typeof sender === "object" ? sender.name : "User";
  const senderAvatar = typeof sender === "object" ? sender.avatar : null;

  return (
    <div
      onClick={handleClick}
      className={`
        px-4 py-3 border-b border-gray-700 cursor-pointer
        transition-colors duration-150 ease-in-out
        ${isRead ? "bg-gray-900" : "bg-gray-800 hover:bg-gray-750"}
        ${!isRead ? "hover:bg-gray-750" : "hover:bg-gray-800"}
      `}
    >
      <div className="flex gap-3">
        {/* Sender Avatar */}
        <div className="flex-shrink-0">
          <UserAvatar
            user={{
              name: senderName,
              avatar: senderAvatar,
            }}
            size="sm"
          />
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-white truncate">
                {title}
              </p>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                {message}
              </p>
            </div>

            {/* Unread Indicator */}
            {!isRead && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
            )}
          </div>

          {/* Time */}
          <p className="text-xs text-gray-500 mt-1">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
