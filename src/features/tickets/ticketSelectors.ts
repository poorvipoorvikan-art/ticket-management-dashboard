import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const selectTicketState = (state: RootState) => state.tickets;

export const selectTickets = createSelector(
  [selectTicketState],
  (state) => state.tickets
);

export const selectTicketLoading = createSelector(
  [selectTicketState],
  (state) => state.loading
);

export const selectTicketError = createSelector(
  [selectTicketState],
  (state) => state.error
);

export const selectTicketFilters = createSelector(
  [selectTicketState],
  (state) => ({
    search: state.search,
    status: state.status,
    priority: state.priority,
    sortBy: state.sortBy,
    order: state.order,
    page: state.page,
    limit: state.limit
  })
);