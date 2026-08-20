import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchNotificationPosts,
} from "../services/notificationApi";

import {
  useNotificationStore,
  type AppNotification,
} from "../store/notificationStore";

const POLLING_INTERVAL = 10000;

const createNotification = (
  post: {
    id: number;
    title: string;
    body: string;
  }
): AppNotification => ({
  id: post.id,
  title: post.title,
  body: post.body,
  createdAt: new Date().toISOString(),
  read: false,
});

export default function NotificationCenter() {
  const notifications =
    useNotificationStore(
      (state) => state.notifications
    );

  const addNotifications =
    useNotificationStore(
      (state) => state.addNotifications
    );

  const markAsRead =
    useNotificationStore(
      (state) => state.markAsRead
    );

  const markAllAsRead =
    useNotificationStore(
      (state) => state.markAllAsRead
    );

  const [isOpen, setIsOpen] =
    useState(false);

  const [isVisible, setIsVisible] =
    useState(!document.hidden);

  const firstPoll = useRef(true);

  const [toast, setToast] = useState("");

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  const pollNotifications =
    useCallback(async () => {
      if (document.hidden) {
        return;
      }

      try {
        const posts =
          await fetchNotificationPosts();

        const existingIds = new Set(
          useNotificationStore
            .getState()
            .notifications.map(
              (notification) =>
                notification.id
            )
        );

        const newPosts = posts.filter(
          (post) =>
            !existingIds.has(post.id)
        );

        if (newPosts.length === 0) {
          return;
        }

        const newNotifications =
          newPosts.map(
            createNotification
          );

        addNotifications(
          newNotifications
        );

        // First API load should not show
        // "new notification" toast.
        if (!firstPoll.current) {
          setToast(
            `${newNotifications.length} new notification${
              newNotifications.length > 1
                ? "s"
                : ""
            }`
          );

          window.setTimeout(() => {
            setToast("");
          }, 3000);
        }

        firstPoll.current = false;
      } catch (error) {
        console.error(
          "Notification polling failed:",
          error
        );
      }
    }, [addNotifications]);

  /*
   * Poll API
   */
  useEffect(() => {
  if (!isVisible) return;

  const runPolling = async () => {
    await pollNotifications();
  };

  runPolling();

  const interval = window.setInterval(() => {
    runPolling();
  }, POLLING_INTERVAL);

  return () => {
    window.clearInterval(interval);
  };
}, [isVisible, pollNotifications]);

  /*
   * Pause polling when tab hidden
   */
  useEffect(() => {
    const handleVisibilityChange =
      () => {
        const visible =
          !document.hidden;

        setIsVisible(visible);

        if (visible) {
          pollNotifications();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [pollNotifications]);

  return (
    <>
      <div className="relative">
        {/* Notification Bell */}

        <button
          type="button"
          onClick={() =>
            setIsOpen(
              (previous) => !previous
            )
          }
          aria-label="Notifications"
          aria-expanded={isOpen}
          className="relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-xl">
            🔔
          </span>

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Notifications
                </h2>

                <p className="text-xs text-slate-500">
                  Latest 20
                </p>
              </div>

              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                disabled={
                  unreadCount === 0
                }
                className="text-xs font-semibold text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length ===
              0 ? (
                <p className="p-6 text-center text-sm text-slate-400">
                  No notifications yet.
                </p>
              ) : (
                notifications.map(
                  (notification) => (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                      className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${
                        notification.read
                          ? "bg-white"
                          : "bg-blue-50"
                      }`}
                    >
                      <div className="flex gap-3">
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                            notification.read
                              ? "bg-slate-300"
                              : "bg-blue-600"
                          }`}
                        />

                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">
                            {
                              notification.title
                            }
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {
                              notification.body
                            }
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-5 z-[100] rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          🔔 {toast}
        </div>
      )}
    </>
  );
}