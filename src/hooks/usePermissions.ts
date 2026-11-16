import { useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  canAssignTickets,
  canCreateTicket,
  canDeleteTicket,
  canEditTicket,
  canManagePriority,
  canManageUsers,
  canUpdateTicketStatus,
  canViewAllTickets,
  canViewTickets
} from "../utils/permissions";

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        canViewTickets: false,
        canViewAllTickets: false,
        canCreateTicket: false,
        canDeleteTicket: false,
        canAssignTickets: false,
        canManageUsers: false,
        canManagePriority: false,
        canUpdateTicketStatus: false,
        canEditTicket: false
      };
    }

    const { role } = user;

    return {
      canViewTickets: canViewTickets(role),
      canViewAllTickets: canViewAllTickets(role),
      canCreateTicket: canCreateTicket(role),
      canDeleteTicket: canDeleteTicket(role),
      canAssignTickets: canAssignTickets(role),
      canManageUsers: canManageUsers(role),
      canManagePriority: canManagePriority(role),
      canUpdateTicketStatus: canUpdateTicketStatus(role),
      canEditTicket: canEditTicket(role)
    };
  }, [user]);
}