import type { UserRole } from "../types/auth.types";

export const canViewTickets = (role: UserRole): boolean =>
  role === "Administrator" ||
  role === "Support Manager" ||
  role === "Support Agent";

export const canViewAllTickets = (role: UserRole): boolean =>
  role === "Administrator" || role === "Support Manager";

export const canCreateTicket = (role: UserRole): boolean =>
  role === "Administrator" ||
  role === "Support Manager" ||
  role === "Support Agent";

export const canDeleteTicket = (role: UserRole): boolean =>
  role === "Administrator";

export const canAssignTickets = (role: UserRole): boolean =>
  role === "Administrator" || role === "Support Manager";

export const canManageUsers = (role: UserRole): boolean =>
  role === "Administrator";

export const canManagePriority = (role: UserRole): boolean =>
  role === "Administrator" || role === "Support Manager";

export const canUpdateTicketStatus = (role: UserRole): boolean =>
  role === "Administrator" ||
  role === "Support Manager" ||
  role === "Support Agent";

export const canEditTicket = (role: UserRole): boolean =>
  role === "Administrator" || role === "Support Manager";