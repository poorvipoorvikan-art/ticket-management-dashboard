import { configureStore } from "@reduxjs/toolkit";
import ticketReducer from "../features/tickets/ticketSlice";
import { ticketApi } from "../features/tickets/ticketApi";

export const store = configureStore({
  reducer: {
    tickets: ticketReducer,
    [ticketApi.reducerPath]: ticketApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ticketApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;