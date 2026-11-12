import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { ticketApi } from "./ticketApi";
import { mockTickets } from "../../test/mocks/handlers";
import { server } from "../../test/mocks/server";
import type { TicketFormData } from "../../types/ticket.types";

const createStore = () =>
  configureStore({
    reducer: {
      [ticketApi.reducerPath]: ticketApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(ticketApi.middleware)
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
  beforeEach(() => {
    server.resetHandlers();
  });

  it("fetches tickets successfully", async () => {
    const store = createStore();

    const result = await store.dispatch(
      ticketApi.endpoints.getTickets.initiate()
    );

    expect(result.data).toEqual(mockTickets);
    expect(
      ticketApi.endpoints.getTickets.select()(store.getState()).data
    ).toEqual(mockTickets);
  });

  it.each([400, 401, 403, 404, 500])(
    "handles HTTP %s responses",
    async (status) => {
      server.use(
        http.get("http://localhost:3001/tickets", () =>
          HttpResponse.json(
            { message: "Request failed" },
            { status }
          )
        )
      );

      const store = createStore();

      const result = await store.dispatch(
        ticketApi.endpoints.getTickets.initiate()
      );

      expect(result.error).toBeDefined();

      if (result.error && "status" in result.error) {
        expect(result.error.status).toBe(status);
      }
    }
  );

  it("creates a ticket successfully", async () => {
    server.use(
      http.post("http://localhost:3001/tickets", async ({ request }) => {
        return HttpResponse.json(await request.json(), { status: 201 });
      })
    );

    const store = createStore();

    const result = await store.dispatch(
      ticketApi.endpoints.createTicket.initiate(ticketFormData)
    );

    expect(result.data).toMatchObject(ticketFormData);

    if (result.data) {
      expect(result.data.id).toMatch(/^TKT-/);
      expect(result.data.createdAt).toBeTruthy();
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
      ticketApi.endpoints.updateTicket.initiate({
        id: "TKT-101",
        data: { ...ticketFormData, status: "In Progress" }
      })
    );

    expect(result.data?.id).toBe("TKT-101");
    expect(result.data?.status).toBe("In Progress");
  });

  it("deletes a ticket successfully", async () => {
    server.use(
      http.delete("http://localhost:3001/tickets/TKT-101", () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    const store = createStore();

    const result = await store.dispatch(
      ticketApi.endpoints.deleteTicket.initiate("TKT-101")
    );

    expect(result.data).toBeNull();
    expect(result.error).toBeUndefined();
  });
});