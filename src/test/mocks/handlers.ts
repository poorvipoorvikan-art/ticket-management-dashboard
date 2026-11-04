import { http, HttpResponse } from "msw";
import type { Ticket } from "../../types/ticket.types";

export const mockTickets: Ticket[] = [
  {
    id: "TKT-101",
    customerName: "Asha Rao",
    email: "asha@example.com",
    subject: "Unable to log in",
    description: "Login fails after entering credentials.",
    priority: "High",
    status: "Open",
    createdAt: "2026-10-01T10:00:00.000Z",
    assignedTo: "agent-1"
  }
];

export const handlers = [
  http.get("http://localhost:3001/tickets", () => {
    return HttpResponse.json(mockTickets);
  })
];