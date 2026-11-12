import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const selectTicketState = (state: RootState) => state.tickets;

export const selectTicketFilters = createSelector(
  [selectTicketState],
  (state) => ({
    search: state.search,
    status: state.status,
    priority: state.priority,
    assignedTo: state.assignedTo,
    sortBy: state.sortBy,
    order: state.order,
    page: state.page,
    limit: state.limit
  })
);