import { useCallback, useEffect } from "react";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  createTicket as createTicketThunk,
  deleteTicket as deleteTicketThunk,
  fetchTickets,
  updateTicket as updateTicketThunk
} from "../features/tickets/ticketThunks";
import type { Ticket, TicketFormData } from "../types/ticket.types";

export function useTickets() {
  const dispatch = useAppDispatch();
  const { tickets, loading, error } = useAppSelector((state) => state.tickets);

  const refetch = useCallback(() => {
    return dispatch(fetchTickets(undefined)).unwrap();
  }, [dispatch]);

  useEffect(() => {
    void refetch().catch(() => undefined);
  }, [refetch]);

  const createTicket = async (data: TicketFormData): Promise<Ticket> => {
    return dispatch(createTicketThunk(data)).unwrap();
  };

  const updateTicket = async (
    id: string,
    data: TicketFormData
  ): Promise<Ticket> => {
    return dispatch(updateTicketThunk({ id, data })).unwrap();
  };

  const deleteTicket = async (id: string): Promise<void> => {
    await dispatch(deleteTicketThunk(id)).unwrap();
  };

  return {
    tickets,
    loading,
    error: error ?? "",
    refetch,
    createTicket,
    updateTicket,
    deleteTicket
  };
}