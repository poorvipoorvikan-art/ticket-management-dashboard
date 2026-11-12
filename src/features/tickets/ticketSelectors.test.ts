import { describe, expect, it } from "vitest";
import type { RootState } from "../../app/store";
import { selectTicketFilters } from "./ticketSelectors";

const ticketState = {
  search: "login",
  status: "Open",
  priority: "High",
  assignedTo: "agent-1",
  sortBy: "priority",
  order: "asc" as const,
  page: 2,
  limit: 5
};

const rootState = {
  tickets: ticketState
} as RootState;

describe("ticket selectors", () => {
  it("selects all ticket filters and pagination values", () => {
    expect(selectTicketFilters(rootState)).toEqual({
      search: "login",
      status: "Open",
      priority: "High",
      assignedTo: "agent-1",
      sortBy: "priority",
      order: "asc",
      page: 2,
      limit: 5
    });
  });
});