import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation
} from "../features/tickets/ticketApi";
import type {
  Ticket,
  TicketFormData
} from "../types/ticket.types";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    if ("data" in error && typeof error.data === "object" && error.data !== null) {
      if ("message" in error.data && typeof error.data.message === "string") {
        return error.data.message;
      }
    }
  }

  return "Something went wrong. Please try again.";
}

export function useTickets() {
  const {
    data: tickets = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useGetTicketsQuery();

  const [createMutation, { isLoading: isCreating }] =
    useCreateTicketMutation();

  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateTicketMutation();

  const [deleteMutation, { isLoading: isDeleting }] =
    useDeleteTicketMutation();

  const createTicket = async (
    data: TicketFormData
  ): Promise<Ticket> => {
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
    loading: isLoading,
    isFetching,
    error: error ? getErrorMessage(error) : "",
    refetch,
    createTicket,
    updateTicket,
    deleteTicket,
    isCreating,
    isUpdating,
    isDeleting
  };
}
