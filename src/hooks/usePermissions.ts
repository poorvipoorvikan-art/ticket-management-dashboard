import { useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  canAssignTickets,
  canCreateTicket,
  canDeleteTicket,
  canEditTicket,
  canManagePriority,
  canUpdateTicketStatus,
  canViewAllTickets
} from "../utils/permissions";

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        canViewAllTickets: false,
        canCreateTicket: false,
        canDeleteTicket: false,
        canAssignTickets: false,
        canManagePriority: false,
        canUpdateTicketStatus: false,
        canEditTicket: false
      };
    }

    const { role } = user;

    return {
      canViewAllTickets: canViewAllTickets(role),
      canCreateTicket: canCreateTicket(role),
      canDeleteTicket: canDeleteTicket(role),
      canAssignTickets: canAssignTickets(role),
      canManagePriority: canManagePriority(role),
      canUpdateTicketStatus: canUpdateTicketStatus(role),
      canEditTicket: canEditTicket(role)
    };
  }, [user]);
}