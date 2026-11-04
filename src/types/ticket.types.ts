export type TicketPriority = "Low" | "Medium" | "High";

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignedTo?: string;
}

export interface TicketFormData {
  customerName: string;
  email: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
}

export interface TicketApiResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}