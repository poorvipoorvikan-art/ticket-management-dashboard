import { createSlice } from "@reduxjs/toolkit";
import type { TicketState } from "../tickets/ticket.types";
import {
  createTicket,
  deleteTicket,
  fetchTickets,
  updateTicket
} from "./ticketThunks";

const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
  creating: false,
  updatingIds: [],
  deletingIds: [],
  search: "",
  status: "All",
  priority: "All",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 5,
  total: 0
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setSearch(state, action: { payload: string }) {
      state.search = action.payload;
      state.page = 1;
    },

    setStatusFilter(state, action: { payload: string }) {
      state.status = action.payload;
      state.page = 1;
    },

    setPriorityFilter(state, action: { payload: string }) {
      state.priority = action.payload;
      state.page = 1;
    },

    setSorting(
      state,
      action: {
        payload: {
          sortBy: string;
          order: "asc" | "desc";
        };
      }
    ) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },

    setPage(state, action: { payload: number }) {
      state.page = action.payload;
    },

    clearTicketError(state) {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to load tickets.";
      })

      .addCase(createTicket.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.creating = false;
        state.tickets.push(action.payload);
        state.total += 1;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload ?? "Unable to create ticket.";
      })

      .addCase(updateTicket.pending, (state, action) => {
        if (!state.updatingIds.includes(action.meta.arg.id)) {
          state.updatingIds.push(action.meta.arg.id);
        }
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.updatingIds = state.updatingIds.filter(
          (id) => id !== action.payload.id
        );

        const index = state.tickets.findIndex(
          (ticket) => ticket.id === action.payload.id
        );

        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.updatingIds = state.updatingIds.filter(
          (id) => id !== action.meta.arg.id
        );
        state.error = action.payload ?? "Unable to update ticket.";
      })

      .addCase(deleteTicket.pending, (state, action) => {
        if (!state.deletingIds.includes(action.meta.arg)) {
          state.deletingIds.push(action.meta.arg);
        }
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.deletingIds = state.deletingIds.filter(
          (id) => id !== action.payload
        );

        state.tickets = state.tickets.filter(
          (ticket) => ticket.id !== action.payload
        );

        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.deletingIds = state.deletingIds.filter(
          (id) => id !== action.meta.arg
        );
        state.error = action.payload ?? "Unable to delete ticket.";
      });
  }
});

export const {
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  setSorting,
  setPage,
  clearTicketError
} = ticketSlice.actions;

export default ticketSlice.reducer;