import type { Ticket } from "./ticket.types";

interface BaseWebSocketEvent {
  eventId: string;
  timestamp: string;
}

export type TicketWebSocketEvent =
  | (BaseWebSocketEvent & {
      type: "TICKET_CREATED";
      payload: { ticket: Ticket };
    })
  | (BaseWebSocketEvent & {
      type: "TICKET_UPDATED";
      payload: { ticket: Ticket };
    })
  | (BaseWebSocketEvent & {
      type: "TICKET_STATUS_CHANGED";
      payload: { ticket: Ticket };
    })
  | (BaseWebSocketEvent & {
      type: "TICKET_ASSIGNED";
      payload: { ticket: Ticket };
    })
  | (BaseWebSocketEvent & {
      type: "TICKET_DELETED";
      payload: { ticketId: string };
    });

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";