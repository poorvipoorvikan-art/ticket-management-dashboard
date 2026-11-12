import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Ticket, TicketFormData } from "../../types/ticket.types";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    timeout: 10000
  }),
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => "/tickets",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Ticket" as const,
                id
              })),
              { type: "Ticket", id: "LIST" }
            ]
          : [{ type: "Ticket", id: "LIST" }]
    }),

    getTicketById: builder.query<Ticket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Ticket", id }
      ]
    }),

    createTicket: builder.mutation<Ticket, TicketFormData>({
      query: (data) => ({
        url: "/tickets",
        method: "POST",
        body: {
          ...data,
          id: `TKT-${Date.now()}`,
          createdAt: new Date().toISOString()
        }
      }),
      invalidatesTags: [{ type: "Ticket", id: "LIST" }]
    }),

    updateTicket: builder.mutation<
      Ticket,
      { id: string; data: TicketFormData }
    >({
      query: ({ id, data }) => ({
        url: `/tickets/${id}`,
        method: "PATCH",
        body: data
      }),
      async onQueryStarted(
        { id, data },
        { dispatch, queryFulfilled }
      ) {
        const listPatch = dispatch(
          ticketApi.util.updateQueryData(
            "getTickets",
            undefined,
            (draft) => {
              const ticket = draft.find((item) => item.id === id);

              if (ticket) {
                Object.assign(ticket, data);
              }
            }
          )
        );

        const detailPatch = dispatch(
          ticketApi.util.updateQueryData(
            "getTicketById",
            id,
            (draft) => {
              Object.assign(draft, data);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          listPatch.undo();
          detailPatch.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" }
      ]
    }),

    deleteTicket: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" }
      ]
    })
  })
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation
} = ticketApi;