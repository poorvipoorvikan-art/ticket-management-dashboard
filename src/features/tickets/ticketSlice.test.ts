import { describe, expect, it } from "vitest";
import reducer, {
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  setAssignedToFilter,
  setSorting,
  setPage,
  clearTicketError
} from "./ticketSlice";
import {
  createTicket,
  deleteTicket,
  fetchTickets,
  updateTicket
} from "./ticketThunks";

const initialState = reducer(undefined, { type: "unknown" });

describe("ticketSlice", () => {
  it("returns the expected initial state", () => {
    expect(initialState).toEqual({
      tickets: [],
      loading: false,
      error: null,
      creating: false,
      updatingIds: [],
      deletingIds: [],
      search: "",
      status: "All",
      priority: "All",
      assignedTo: "All",
      sortBy: "createdAt",
      order: "desc",
      page: 1,
      limit: 5,
      total: 0
    });
  });

  it("updates search and resets the page", () => {
    const state = reducer(
      { ...initialState, page: 3 },
      setSearch("login")
    );

    expect(state.search).toBe("login");
    expect(state.page).toBe(1);
  });

  it("updates status and resets the page", () => {
    const state = reducer(
      { ...initialState, page: 3 },
      setStatusFilter("Open")
    );

    expect(state.status).toBe("Open");
    expect(state.page).toBe(1);
  });

  it("updates priority and resets the page", () => {
    const state = reducer(
      { ...initialState, page: 3 },
      setPriorityFilter("High")
    );

    expect(state.priority).toBe("High");
    expect(state.page).toBe(1);
  });

  it("updates assigned agent and resets the page", () => {
    const state = reducer(
      { ...initialState, page: 3 },
      setAssignedToFilter("agent-1")
    );

    expect(state.assignedTo).toBe("agent-1");
    expect(state.page).toBe(1);
  });

  it("updates sorting and resets the page", () => {
    const state = reducer(
      { ...initialState, page: 3 },
      setSorting({ sortBy: "priority", order: "asc" })
    );

    expect(state.sortBy).toBe("priority");
    expect(state.order).toBe("asc");
    expect(state.page).toBe(1);
  });

  it("sets the current page", () => {
    expect(reducer(initialState, setPage(2)).page).toBe(2);
  });

  it("clears the ticket error", () => {
    const state = reducer(
      { ...initialState, error: "Something failed" },
      clearTicketError()
    );

    expect(state.error).toBeNull();
  });

  it("sets loading when fetching tickets", () => {
    const state = reducer(initialState, fetchTickets.pending("", undefined));

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores an error when fetching tickets fails", () => {
    const state = reducer(
      initialState,
      fetchTickets.rejected(
        new Error("Request failed"),
        "",
        undefined,
        "Unable to load tickets."
      )
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Unable to load tickets.");
  });

  it("sets creating when ticket creation starts", () => {
    const state = reducer(
      initialState,
      createTicket.pending("", {} as never)
    );

    expect(state.creating).toBe(true);
  });

  it("tracks an updating ticket while the update is pending", () => {
    const state = reducer(
      initialState,
      updateTicket.pending("", { id: "ticket-1" } as never)
    );

    expect(state.updatingIds).toContain("ticket-1");
  });

  it("tracks a deleting ticket while deletion is pending", () => {
    const state = reducer(
      initialState,
      deleteTicket.pending("", "ticket-1")
    );

    expect(state.deletingIds).toContain("ticket-1");
  });
});