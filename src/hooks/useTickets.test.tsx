import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTickets } from "./useTickets";

const mocks = vi.hoisted(() => ({
  useGetTicketsQuery: vi.fn(),
  useCreateTicketMutation: vi.fn(),
  useUpdateTicketMutation: vi.fn(),
  useDeleteTicketMutation: vi.fn(),
  createMutation: vi.fn(),
  updateMutation: vi.fn(),
  deleteMutation: vi.fn(),
  refetch: vi.fn()
}));

vi.mock("../features/tickets/ticketApi", () => ({
  useGetTicketsQuery: mocks.useGetTicketsQuery,
  useCreateTicketMutation: mocks.useCreateTicketMutation,
  useUpdateTicketMutation: mocks.useUpdateTicketMutation,
  useDeleteTicketMutation: mocks.useDeleteTicketMutation
}));

describe("useTickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useGetTicketsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mocks.refetch
    });

    mocks.useCreateTicketMutation.mockReturnValue([
      mocks.createMutation,
      { isLoading: false }
    ]);

    mocks.useUpdateTicketMutation.mockReturnValue([
      mocks.updateMutation,
      { isLoading: false }
    ]);

    mocks.useDeleteTicketMutation.mockReturnValue([
      mocks.deleteMutation,
      { isLoading: false }
    ]);
  });

  it("returns loading state while tickets are being fetched", () => {
    mocks.useGetTicketsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: mocks.refetch
    });

    const { result } = renderHook(() => useTickets());

    expect(result.current.loading).toBe(true);
    expect(result.current.isFetching).toBe(true);
  });

  it("returns a meaningful API error message", () => {
    mocks.useGetTicketsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: {
        type: "network",
        message: "Unable to connect to the server. Check your internet connection."
      },
      refetch: mocks.refetch
    });

    const { result } = renderHook(() => useTickets());

    expect(result.current.error).toBe(
      "Unable to connect to the server. Check your internet connection."
    );
  });

  it("exposes the refetch function for retrying requests", () => {
    const { result } = renderHook(() => useTickets());

    result.current.refetch();

    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });

  it("returns an empty ticket list when the API has no data", () => {
    mocks.useGetTicketsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mocks.refetch
    });

    const { result } = renderHook(() => useTickets());

    expect(result.current.tickets).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });
});