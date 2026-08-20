import { create } from "zustand";

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];

  addNotifications: (
    notifications: AppNotification[]
  ) => void;

  markAsRead: (id: number) => void;

  markAllAsRead: () => void;
}

const STORAGE_KEY = "sprintdesk-notifications";

const getSavedNotifications = (): AppNotification[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      "Failed to load notifications:",
      error
    );

    return [];
  }
};

const saveNotifications = (
  notifications: AppNotification[]
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        notifications.slice(0, 20)
      )
    );
  } catch (error) {
    console.error(
      "Failed to save notifications:",
      error
    );
  }
};

export const useNotificationStore =
  create<NotificationState>((set) => ({
    notifications: getSavedNotifications(),

    addNotifications: (newNotifications) =>
      set((state) => {
        const existingIds = new Set(
          state.notifications.map(
            (notification) => notification.id
          )
        );

        const uniqueNotifications =
          newNotifications.filter(
            (notification) =>
              !existingIds.has(notification.id)
          );

        if (
          uniqueNotifications.length === 0
        ) {
          return state;
        }

        const updatedNotifications = [
          ...uniqueNotifications,
          ...state.notifications,
        ].slice(0, 20);

        saveNotifications(
          updatedNotifications
        );

        return {
          notifications:
            updatedNotifications,
        };
      }),

    markAsRead: (id) =>
      set((state) => {
        const updatedNotifications =
          state.notifications.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          );

        saveNotifications(
          updatedNotifications
        );

        return {
          notifications:
            updatedNotifications,
        };
      }),

    markAllAsRead: () =>
      set((state) => {
        const updatedNotifications =
          state.notifications.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          );

        saveNotifications(
          updatedNotifications
        );

        return {
          notifications:
            updatedNotifications,
        };
      }),
  }));