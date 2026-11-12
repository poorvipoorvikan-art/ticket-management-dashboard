import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TicketState } from "../tickets/ticket.types";

const initialState: TicketState = {
  search: "",
  status: "All",
  priority: "All",
  assignedTo: "All",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 5,
  selectedTicketIds: []
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
      state.page = 1;
    },
    setPriorityFilter: (state, action: PayloadAction<string>) => {
      state.priority = action.payload;
      state.page = 1;
    },
    setAssignedToFilter: (state, action: PayloadAction<string>) => {
      state.assignedTo = action.payload;
      state.page = 1;
    },
    setSorting: (
      state,
      action: PayloadAction<{
        sortBy: string;
        order: "asc" | "desc";
      }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    toggleTicketSelection: (state, action: PayloadAction<string>) => {
      const ticketId = action.payload;

      if (state.selectedTicketIds.includes(ticketId)) {
        state.selectedTicketIds = state.selectedTicketIds.filter(
          (id) => id !== ticketId
        );
      } else {
        state.selectedTicketIds.push(ticketId);
      }
    },
    toggleTicketsSelection: (state, action: PayloadAction<string[]>) => {
      const ticketIds = action.payload;

      const allSelected = ticketIds.every((id) =>
        state.selectedTicketIds.includes(id)
      );

      if (allSelected) {
        state.selectedTicketIds = state.selectedTicketIds.filter(
          (id) => !ticketIds.includes(id)
        );
      } else {
        const selectedIds = new Set(state.selectedTicketIds);

        ticketIds.forEach((id) => selectedIds.add(id));

        state.selectedTicketIds = Array.from(selectedIds);
      }
    },
    clearSelectedTickets: (state) => {
      state.selectedTicketIds = [];
    }
  }
});

export const {
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  setAssignedToFilter,
  setSorting,
  setPage,
  toggleTicketSelection,
  toggleTicketsSelection,
  clearSelectedTickets
} = ticketSlice.actions;

export default ticketSlice.reducer;