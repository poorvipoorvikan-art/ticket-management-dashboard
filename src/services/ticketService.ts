import { apiClient } from "./apiClient";
import type { Ticket, TicketFormData } from "../types/ticket.types";

export interface TicketQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  assignedTo?: string;
}

export const ticketService = {
  async getTickets(
    params: TicketQueryParams = {},
    signal?: AbortSignal
  ): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>("/tickets", {
      params,
      signal
    });

    return response.data;
  },

  async getTicketById(
    id: string,
    signal?: AbortSignal
  ): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`, {
      signal
    });

    return response.data;
  },

  async createTicket(data: TicketFormData): Promise<Ticket> {
    const ticket: Ticket = {
      ...data,
      id: `TKT-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const response = await apiClient.post<Ticket>("/tickets", ticket);
    return response.data;
  },

  async updateTicket(
    id: string,
    data: TicketFormData
  ): Promise<Ticket> {
    const response = await apiClient.patch<Ticket>(`/tickets/${id}`, data);
    return response.data;
  },

  async deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  }
};