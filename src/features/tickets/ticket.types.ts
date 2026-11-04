import type { Ticket } from "../../types/ticket.types";

export interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updatingIds: string[];
  deletingIds: string[];
  search: string;
  status: string;
  priority: string;
  sortBy: string;
  order: "asc" | "desc";
  page: number;
  limit: number;
  total: number;
}