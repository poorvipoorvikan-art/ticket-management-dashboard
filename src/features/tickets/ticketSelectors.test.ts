import { describe, expect, it } from "vitest";
import type { RootState } from "../../app/store";
import {
  selectTickets,
  selectTicketLoading,
  selectTicketError,
  selectTicketFilters
} from "./ticketSelectors";

const ticketState = {
  tickets: [],
  loading: true,
  error: "Request failed",
  creating: false,
  updatingIds: [],
  deletingIds: [],
  search: "login",
  status: "Open",
  priority: "High",
  sortBy: "priority",
  order: "asc" as const,
  page: 2,
  limit: 5,
  total: 0
};

const rootState = {
  tickets: ticketState
} as RootState;

describe("ticket selectors", () => {
  it("selects the ticket list", () => {
    expect(selectTickets(rootState)).toEqual([]);
  });

  it("selects the loading state", () => {
    expect(selectTicketLoading(rootState)).toBe(true);
  });

  it("selects the error", () => {
    expect(selectTicketError(rootState)).toBe("Request failed");
  });

  it("selects all ticket filters and pagination values", () => {
    expect(selectTicketFilters(rootState)).toEqual({
      search: "login",
      status: "Open",
      priority: "High",
      sortBy: "priority",
      order: "asc",
      page: 2,
      limit: 5
    });
  });
});