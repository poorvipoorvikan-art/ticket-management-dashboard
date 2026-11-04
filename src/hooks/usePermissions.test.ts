// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";
import type { UserRole } from "../types/auth.types";

vi.mock("./useAuth", () => ({
  useAuth: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns no permissions when the user is logged out", () => {
    mockedUseAuth.mockReturnValue({
      user: null
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canViewAllTickets: false,
      canCreateTicket: false,
      canDeleteTicket: false,
      canAssignTickets: false,
      canManagePriority: false,
      canUpdateTicketStatus: false,
      canEditTicket: false
    });
  });

  it("returns all permissions for an Administrator", () => {
    mockedUseAuth.mockReturnValue({
      user: { role: "Administrator" as UserRole }
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());

    expect(Object.values(result.current).every(Boolean)).toBe(true);
  });

  it("returns the expected permissions for a Support Manager", () => {
    mockedUseAuth.mockReturnValue({
      user: { role: "Support Manager" as UserRole }
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canViewAllTickets: true,
      canCreateTicket: false,
      canDeleteTicket: false,
      canAssignTickets: true,
      canManagePriority: true,
      canUpdateTicketStatus: true,
      canEditTicket: true
    });
  });

  it("returns the expected permissions for a Support Agent", () => {
    mockedUseAuth.mockReturnValue({
      user: { role: "Support Agent" as UserRole }
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canViewAllTickets: false,
      canCreateTicket: false,
      canDeleteTicket: false,
      canAssignTickets: false,
      canManagePriority: false,
      canUpdateTicketStatus: true,
      canEditTicket: false
    });
  });
});