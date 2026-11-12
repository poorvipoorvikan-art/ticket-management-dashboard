import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation
} from "../features/tickets/ticketApi";
import type { Ticket, TicketFormData } from "../types/ticket.types";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("data" in error && typeof error.data === "string") {
      return error.data;
    }

    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return "An unexpected error occurred.";
}

export function useTickets() {
  const {
    data: tickets = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useGetTicketsQuery();

  const [createMutation] = useCreateTicketMutation();
  const [updateMutation] = useUpdateTicketMutation();
  const [deleteMutation] = useDeleteTicketMutation();

  const createTicket = async (data: TicketFormData): Promise<Ticket> => {
    return createMutation(data).unwrap();
  };

  const updateTicket = async (
    id: string,
    data: TicketFormData
  ): Promise<Ticket> => {
    return updateMutation({ id, data }).unwrap();
  };

  const deleteTicket = async (id: string): Promise<void> => {
    await deleteMutation(id).unwrap();
  };

  return {
    tickets,
    loading: isLoading || isFetching,
    error: error ? getErrorMessage(error) : "",
    refetch,
    createTicket,
    updateTicket,
    deleteTicket
  };
}