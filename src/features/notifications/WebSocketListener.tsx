import { useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { ticketApi } from "../tickets/ticketApi";
import {
  addNotification,
  setConnectionError,
  setConnectionStatus
} from "./notificationSlice";
import type { TicketWebSocketEvent } from "../../types/websocket.types";

function WebSocketListener() {
  const dispatch = useAppDispatch();
  const processedEvents = useRef(new Set<string>());

  const handleMessage = useCallback(
    (event: TicketWebSocketEvent) => {
      const { type, eventId, timestamp, payload } = event;

      if (processedEvents.current.has(eventId)) return;

      processedEvents.current.add(eventId);

      if (processedEvents.current.size > 500) {
        const oldestEvent = processedEvents.current.values().next().value;
        if (oldestEvent) processedEvents.current.delete(oldestEvent);
      }

      if (type === "TICKET_DELETED") {
        dispatch(
          ticketApi.util.updateQueryData(
            "getTickets",
            undefined,
            (draft) => {
              const index = draft.findIndex(
                (ticket) => ticket.id === payload.ticketId
              );

              if (index !== -1) draft.splice(index, 1);
            }
          )
        );

        dispatch(
          ticketApi.util.invalidateTags([
            { type: "Ticket", id: payload.ticketId }
          ])
        );

        dispatch(
          addNotification({
            id: eventId,
            eventId,
            type,
            message: `Ticket ${payload.ticketId} was deleted`,
            ticketId: payload.ticketId,
            ticketSubject: payload.ticketId,
            timestamp,
            isRead: false
          })
        );

        return;
      }

      const ticket = payload.ticket;

      dispatch(
        ticketApi.util.updateQueryData(
          "getTickets",
          undefined,
          (draft) => {
            const index = draft.findIndex(
              (item) => item.id === ticket.id
            );

            if (index === -1) {
              draft.push(ticket);
            } else {
              draft[index] = ticket;
            }
          }
        )
      );

      dispatch(
        ticketApi.util.updateQueryData(
          "getTicketById",
          ticket.id,
          (draft) => {
            Object.assign(draft, ticket);
          }
        )
      );

      const messages: Record<
        Exclude<TicketWebSocketEvent["type"], "TICKET_DELETED">,
        string
      > = {
        TICKET_CREATED: "A new ticket was created",
        TICKET_UPDATED: "A ticket was updated",
        TICKET_STATUS_CHANGED: `Ticket status changed to ${ticket.status}`,
        TICKET_ASSIGNED: "A ticket assignment was updated"
      };

      dispatch(
        addNotification({
          id: eventId,
          eventId,
          type,
          message: messages[type],
          ticketId: ticket.id,
          ticketSubject: ticket.subject,
          timestamp,
          isRead: false
        })
      );
    },
    [dispatch]
  );

  const { status, error } = useWebSocket(handleMessage);

  useEffect(() => {
    dispatch(setConnectionStatus(status));
  }, [dispatch, status]);

  useEffect(() => {
    dispatch(setConnectionError(error));
  }, [dispatch, error]);

  return null;
}

export default WebSocketListener;