import { useState } from "react";
import {
  clearNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "./notificationSlice";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notifications
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "Unknown time";

    return date.toLocaleString();
  };

  const handleNotificationClick = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        className="relative grid size-10 place-items-center rounded-xl text-xl text-slate-600 transition hover:bg-slate-100"
      >
        ♧
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Notifications
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(markAllNotificationsAsRead())}
              disabled={unreadCount === 0}
              className="text-xs font-semibold text-indigo-600 disabled:text-slate-300"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Ticket updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    notification.isRead ? "bg-white" : "bg-indigo-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-slate-300"
                          : "bg-indigo-500"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">
                        {notification.message}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {notification.ticketSubject}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-400">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 text-right">
              <button
                type="button"
                onClick={() => dispatch(clearNotifications())}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}