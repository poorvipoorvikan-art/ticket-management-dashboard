import { describe, expect, it } from "vitest";
import reducer, {
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  setAssignedToFilter,
  setSorting,
  setPage,
  toggleTicketSelection,
  toggleTicketsSelection,
  clearSelectedTickets
} from "./ticketSlice";

const initialState = reducer(undefined, { type: "unknown" });

describe("ticketSlice", () => {
  it("returns the expected initial state", () => {
    expect(initialState).toEqual({
      search: "",
      status: "All",
      priority: "All",
      assignedTo: "All",
      sortBy: "createdAt",
      order: "desc",
      page: 1,
      limit: 5,
      selectedTicketIds: []
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

  it("selects and deselects an individual ticket", () => {
    const selectedState = reducer(
      initialState,
      toggleTicketSelection("TKT-101")
    );

    expect(selectedState.selectedTicketIds).toEqual(["TKT-101"]);

    const deselectedState = reducer(
      selectedState,
      toggleTicketSelection("TKT-101")
    );

    expect(deselectedState.selectedTicketIds).toEqual([]);
  });

  it("selects multiple tickets", () => {
    const state = reducer(
      initialState,
      toggleTicketsSelection(["TKT-101", "TKT-102"])
    );

    expect(state.selectedTicketIds).toEqual([
      "TKT-101",
      "TKT-102"
    ]);
  });

  it("deselects all tickets on the current page", () => {
    const stateWithSelection = {
      ...initialState,
      selectedTicketIds: ["TKT-101", "TKT-102", "TKT-103"]
    };

    const state = reducer(
      stateWithSelection,
      toggleTicketsSelection(["TKT-101", "TKT-102"])
    );

    expect(state.selectedTicketIds).toEqual(["TKT-103"]);
  });

  it("does not add duplicate ticket IDs", () => {
    const stateWithSelection = {
      ...initialState,
      selectedTicketIds: ["TKT-101"]
    };

    const state = reducer(
      stateWithSelection,
      toggleTicketsSelection(["TKT-101", "TKT-102"])
    );

    expect(state.selectedTicketIds).toEqual([
      "TKT-101",
      "TKT-102"
    ]);
  });

  it("clears all selected tickets", () => {
    const stateWithSelection = {
      ...initialState,
      selectedTicketIds: ["TKT-101", "TKT-102"]
    };

    const state = reducer(
      stateWithSelection,
      clearSelectedTickets()
    );

    expect(state.selectedTicketIds).toEqual([]);
  });
});