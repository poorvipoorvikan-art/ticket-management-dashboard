import type {
  TicketWebSocketEvent,
  WebSocketStatus
} from "../types/websocket.types";

interface WebSocketHandlers {
  onMessage: (event: TicketWebSocketEvent) => void;
  onStatusChange: (status: WebSocketStatus) => void;
  onError: (error: string) => void;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers: WebSocketHandlers | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private manuallyClosed = false;
  private connectionId = 0;

  private readonly maxReconnectDelay = 30000;

  connect(handlers: WebSocketHandlers) {
    this.handlers = handlers;
    this.manuallyClosed = false;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.clearReconnectTimer();

    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      handlers.onError("WebSocket URL is not configured");
      return;
    }

    const url = new URL(apiUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";

    handlers.onStatusChange(
      this.reconnectAttempts > 0 ? "reconnecting" : "connecting"
    );

    const currentConnectionId = ++this.connectionId;

    try {
      const socket = new WebSocket(url.toString());
      this.socket = socket;

      socket.onopen = () => {
        if (currentConnectionId !== this.connectionId) return;

        this.reconnectAttempts = 0;
        this.handlers?.onStatusChange("connected");
      };

      socket.onmessage = (message) => {
        if (currentConnectionId !== this.connectionId) return;

        try {
          const event = JSON.parse(message.data);

          if (!this.isValidEvent(event)) {
            this.handlers?.onError("Received an invalid WebSocket event");
            return;
          }

          this.handlers?.onMessage(event);
        } catch {
          this.handlers?.onError("Unable to parse WebSocket message");
        }
      };

      socket.onerror = () => {
        if (currentConnectionId !== this.connectionId) return;

        this.handlers?.onError("WebSocket connection error");
      };

      socket.onclose = () => {
        if (currentConnectionId !== this.connectionId) return;

        this.socket = null;
        this.handlers?.onStatusChange("disconnected");
        this.scheduleReconnect();
      };
    } catch {
      if (currentConnectionId !== this.connectionId) return;

      this.handlers?.onError("Unable to establish WebSocket connection");
      this.scheduleReconnect();
    }
  }

  send(data: unknown): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify(data));
    return true;
  }

  disconnect() {
    this.manuallyClosed = true;
    this.connectionId += 1;

    this.clearReconnectTimer();
    this.reconnectAttempts = 0;

    const socket = this.socket;
    this.socket = null;

    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    }

    this.handlers?.onStatusChange("disconnected");
    this.handlers = null;
  }

  private scheduleReconnect() {
    if (this.manuallyClosed || this.reconnectTimer) {
      return;
    }

    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      this.maxReconnectDelay
    );

    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (this.handlers && !this.manuallyClosed) {
        this.connect(this.handlers);
      }
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private isValidEvent(
    event: unknown
  ): event is TicketWebSocketEvent {
    if (!event || typeof event !== "object") {
      return false;
    }

    const message = event as Record<string, unknown>;

    if (
      typeof message.eventId !== "string" ||
      typeof message.timestamp !== "string" ||
      !message.payload ||
      typeof message.payload !== "object"
    ) {
      return false;
    }

    const payload = message.payload as Record<string, unknown>;

    switch (message.type) {
      case "TICKET_CREATED":
      case "TICKET_UPDATED":
      case "TICKET_STATUS_CHANGED":
      case "TICKET_ASSIGNED":
        return Boolean(
          payload.ticket &&
          typeof payload.ticket === "object" &&
          typeof (payload.ticket as Record<string, unknown>).id === "string"
        );

      case "TICKET_DELETED":
        return typeof payload.ticketId === "string";

      default:
        return false;
    }
  }
}

export const websocketService = new WebSocketService();