import { useCallback, useEffect, useRef, useState } from "react";
import { websocketService } from "../services/websocketService";
import type {
  TicketWebSocketEvent,
  WebSocketStatus
} from "../types/websocket.types";

export function useWebSocket(
  onMessage: (event: TicketWebSocketEvent) => void
) {
  const [status, setStatus] =
    useState<WebSocketStatus>("disconnected");

  const [error, setError] = useState<string | null>(null);

  const messageHandler = useRef(onMessage);

  useEffect(() => {
    messageHandler.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    setError(null);

    websocketService.connect({
      onMessage: (event) => {
        messageHandler.current(event);
      },
      onStatusChange: setStatus,
      onError: setError
    });
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    websocketService.disconnect();
    connect();
  }, [connect]);

  const send = useCallback((data: unknown) => {
    return websocketService.send(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(connect, 0);

    return () => {
      clearTimeout(timer);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    error,
    send,
    reconnect,
    disconnect
  };
}