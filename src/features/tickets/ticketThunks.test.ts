import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import ticketReducer from "./ticketSlice";
import {
  createTicket,
  deleteTicket,
  fetchTickets,
  updateTicket
} from "./ticketThunks";
import { mockTickets } from "../../test/mocks/handlers";
import { server } from "../../test/mocks/server";
import type { TicketFormData } from "../../types/ticket.types";

const createStore = () =>
  configureStore({
    reducer: { tickets: ticketReducer }
  });

const ticketFormData: TicketFormData = {
  customerName: "Asha Rao",
  email: "asha@example.com",
  subject: "Unable to log in",
  description: "Login fails after entering credentials.",
  priority: "High",
  status: "Open",
  assignedTo: "agent-1"
};

describe("ticket API integration", () => {
  it("fetches tickets successfully", async () => {
    const store = createStore();
    const result = await store.dispatch(fetchTickets());

    expect(fetchTickets.fulfilled.match(result)).toBe(true);
    expect(store.getState().tickets.tickets).toEqual(mockTickets);
    expect(store.getState().tickets.loading).toBe(false);
    expect(store.getState().tickets.error).toBeNull();
  });

  it("handles a 400 bad request", async () => {
    server.use(
      http.get("http://localhost:3001/tickets", () =>
        HttpResponse.json({ message: "Bad request" }, { status: 400 })
      )
    );

    const store = createStore();
    const result = await store.dispatch(fetchTickets());

    expect(fetchTickets.rejected.match(result)).toBe(true);
    expect(result.payload).toBe(
      "Bad request. Please check the submitted information."
    );
    expect(store.getState().tickets.loading).toBe(false);
    expect(store.getState().tickets.error).toBe(
      "Bad request. Please check the submitted information."
    );
  });

  it("handles a 401 unauthorized response", async () => {
    server.use(
      http.get("http://localhost:3001/tickets", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
      )
    );

    const store = createStore();
    const result = await store.dispatch(fetchTickets());

    expect(fetchTickets.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("Unauthorized. Please log in again.");
    expect(store.getState().tickets.loading).toBe(false);
    expect(store.getState().tickets.error).toBe(
      "Unauthorized. Please log in again."
    );
  });

  it("handles a 403 forbidden response", async () => {
    server.use(
      http.get("http://localhost:3001/tickets", () =>
        HttpResponse.json({ message: "Forbidden" }, { status: 403 })
      )
    );

    const store = createStore();
    const result = await store.dispatch(fetchTickets());

    expect(fetchTickets.rejected.match(result)).toBe(true);
    expect(result.payload).toBe(
      "You do not have permission to perform this action."
    );
    expect(store.getState().tickets.loading).toBe(false);
    expect(store.getState().tickets.error).toBe(
      "You do not have permission to perform this action."
    );
  });

  it("handles a 404 response", async () => {
    server.use(
      http.get("http://localhost:3001/tickets", () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 })
      )
    );

    const store = createStore();
    const result = await store.dispatch(fetchTickets());

    expect(fetchTickets.rejected.match(result)).toBe(true);
    expect(result.payload).toBe("The requested resource was not found.");
    expect(store.getState().tickets.loading).toBe(false);
    expect(store.getState().tickets.error).toBe(
      "The requested resource was not found."
    );
  });

  it("handles a 500 server error", async () => {
    server.use(
      http.get("http://localhost:3001/tickets", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 })
      )
    );

    const store = createStore();
    const result = await store.dispatch(fetchTickets());

    expect(fetchTickets.rejected.match(result)).toBe(true);
    expect(result.payload).toBe(
      "Internal server error. Please try again later."
    );
    expect(store.getState().tickets.loading).toBe(false);
    expect(store.getState().tickets.error).toBe(
      "Internal server error. Please try again later."
    );
  });

  it("creates a ticket successfully", async () => {
    server.use(
      http.post("http://localhost:3001/tickets", async ({ request }) => {
        return HttpResponse.json(await request.json(), { status: 201 });
      })
    );

    const store = createStore();
    const result = await store.dispatch(createTicket(ticketFormData));

    expect(createTicket.fulfilled.match(result)).toBe(true);

    if (createTicket.fulfilled.match(result)) {
      expect(result.payload).toMatchObject(ticketFormData);
      expect(result.payload.id).toMatch(/^TKT-/);
      expect(result.payload.createdAt).toBeTruthy();
    }
  });

  it("updates a ticket successfully", async () => {
    server.use(
      http.patch(
        "http://localhost:3001/tickets/TKT-101",
        async ({ request }) => {
          const data = (await request.json()) as TicketFormData;

          return HttpResponse.json({
            ...data,
            id: "TKT-101",
            createdAt: mockTickets[0].createdAt
          });
        }
      )
    );

    const store = createStore();
    const result = await store.dispatch(
      updateTicket({
        id: "TKT-101",
        data: { ...ticketFormData, status: "In Progress" }
      })
    );

    expect(updateTicket.fulfilled.match(result)).toBe(true);

    if (updateTicket.fulfilled.match(result)) {
      expect(result.payload.id).toBe("TKT-101");
      expect(result.payload.status).toBe("In Progress");
    }
  });

  it("deletes a ticket successfully", async () => {
    server.use(
      http.delete("http://localhost:3001/tickets/TKT-101", () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    const store = createStore();
    const result = await store.dispatch(deleteTicket("TKT-101"));

    expect(deleteTicket.fulfilled.match(result)).toBe(true);

    if (deleteTicket.fulfilled.match(result)) {
      expect(result.payload).toBe("TKT-101");
    }
  });
});