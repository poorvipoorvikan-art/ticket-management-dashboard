import type {
  TicketWebSocketEvent,
  WebSocketStatus
} from "../../types/websocket.types";

export interface Notification {
  id: string;
  eventId: string;
  type: TicketWebSocketEvent["type"];
  message: string;
  ticketId: string;
  ticketSubject: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  connectionStatus: WebSocketStatus;
  connectionError: string | null;
}