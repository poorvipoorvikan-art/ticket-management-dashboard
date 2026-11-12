export interface TicketState {
  search: string;
  status: string;
  priority: string;
  assignedTo: string;
  sortBy: string;
  order: "asc" | "desc";
  page: number;
  limit: number;
  selectedTicketIds: string[];
}