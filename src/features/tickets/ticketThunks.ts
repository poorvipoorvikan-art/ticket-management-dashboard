import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  ticketService} from "../../services/ticketService";
import type { Ticket, TicketFormData } from "../../types/ticket.types";

export const fetchTickets = createAsyncThunk<
  Ticket[],
  void,
  { rejectValue: string }
>("tickets/fetchTickets", async (_, { rejectWithValue, signal }) => {
  try {
    return await ticketService.getTickets(undefined, signal);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load tickets."
    );
  }
});

export const createTicket = createAsyncThunk<
  Ticket,
  TicketFormData,
  { rejectValue: string }
>("tickets/createTicket", async (data, { rejectWithValue }) => {
  try {
    return await ticketService.createTicket(data);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to create ticket."
    );
  }
});

export const updateTicket = createAsyncThunk<
  Ticket,
  { id: string; data: TicketFormData },
  { rejectValue: string }
>("tickets/updateTicket", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await ticketService.updateTicket(id, data);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to update ticket."
    );
  }
});

export const deleteTicket = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tickets/deleteTicket", async (id, { rejectWithValue }) => {
  try {
    await ticketService.deleteTicket(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to delete ticket."
    );
  }
});