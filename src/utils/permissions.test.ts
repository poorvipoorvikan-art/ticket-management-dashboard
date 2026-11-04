import { describe, expect, it } from "vitest";
import {
  canViewAllTickets,
  canCreateTicket,
  canDeleteTicket,
  canAssignTickets,
  canManagePriority,
  canUpdateTicketStatus,
  canEditTicket
} from "./permissions";
import type { UserRole } from "../types/auth.types";

const roles: UserRole[] = [
  "Administrator",
  "Support Manager",
  "Support Agent"
];

describe("ticket permissions", () => {
  it("allows only Administrator to create and delete tickets", () => {
    roles.forEach((role) => {
      const expected = role === "Administrator";

      expect(canCreateTicket(role)).toBe(expected);
      expect(canDeleteTicket(role)).toBe(expected);
    });
  });

  it("allows Administrator and Support Manager to view all tickets", () => {
    roles.forEach((role) => {
      const expected =
        role === "Administrator" || role === "Support Manager";

      expect(canViewAllTickets(role)).toBe(expected);
    });
  });

  it("allows Administrator and Support Manager to assign tickets", () => {
    roles.forEach((role) => {
      const expected =
        role === "Administrator" || role === "Support Manager";

      expect(canAssignTickets(role)).toBe(expected);
    });
  });

  it("allows Administrator and Support Manager to manage priority", () => {
    roles.forEach((role) => {
      const expected =
        role === "Administrator" || role === "Support Manager";

      expect(canManagePriority(role)).toBe(expected);
    });
  });

  it("allows all three roles to update ticket status", () => {
    roles.forEach((role) => {
      expect(canUpdateTicketStatus(role)).toBe(true);
    });
  });

  it("allows Administrator and Support Manager to edit tickets", () => {
    roles.forEach((role) => {
      const expected =
        role === "Administrator" || role === "Support Manager";

      expect(canEditTicket(role)).toBe(expected);
    });
  });
});