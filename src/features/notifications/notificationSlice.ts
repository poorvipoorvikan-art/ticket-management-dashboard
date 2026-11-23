import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Notification,
  NotificationState
} from "./notification.types";
import type { WebSocketStatus } from "../../types/websocket.types";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: "connecting",
  connectionError: null
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;

      if (state.notifications.some((item) => item.eventId === notification.eventId)) {
        return;
      }

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (item) => item.id === action.payload
      );

      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });

      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    setConnectionStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.connectionStatus = action.payload;

      if (action.payload === "connected") {
        state.connectionError = null;
      }
    },

    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
    }
  }
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setConnectionStatus,
  setConnectionError
} = notificationSlice.actions;

export default notificationSlice.reducer;