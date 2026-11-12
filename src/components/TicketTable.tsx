import { useState } from "react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import {
  toggleTicketSelection,
  toggleTicketsSelection,
  clearSelectedTickets
} from "../features/tickets/ticketSlice";
import type {
  Ticket,
  TicketFormData,
  TicketStatus
} from "../types/ticket.types";
import { usePermissions } from "../hooks/usePermissions";
import { authService } from "../services/authService";

interface TicketTableProps {
  tickets: Ticket[];
  allTickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket, skipConfirmation?: boolean) => void;
  onUpdate: (id: string, data: TicketFormData) => Promise<Ticket>;
}

const ticketStatuses: TicketStatus[] = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed"
];

export default function TicketTable({
  tickets,
  allTickets,
  onEdit,
  onDelete,
  onUpdate
}: TicketTableProps) {
  const dispatch = useAppDispatch();

  const selectedIds = useAppSelector(
    (state) => state.tickets.selectedTicketIds
  );

  const {
    canEditTicket,
    canDeleteTicket,
    canAssignTickets,
    canUpdateTicketStatus
  } = usePermissions();

  const agents = authService.getSupportAgents();

  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [bulkStatus, setBulkStatus] = useState<TicketStatus>("Open");
  const [bulkAssignedTo, setBulkAssignedTo] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const showActions =
    canEditTicket ||
    canDeleteTicket ||
    canUpdateTicketStatus ||
    canAssignTickets;

  const canUseBulkActions =
    canDeleteTicket || canUpdateTicketStatus || canAssignTickets;

  const selectableTickets = canUseBulkActions ? tickets : [];

  const allSelected =
    selectableTickets.length > 0 &&
    selectableTickets.every((ticket) => selectedIds.includes(ticket.id));

  const selectedTickets = allTickets.filter((ticket) =>
    selectedIds.includes(ticket.id)
  );

  const toggleTicket = (ticketId: string) => {
    dispatch(toggleTicketSelection(ticketId));
  };

  const toggleAll = () => {
    dispatch(
      toggleTicketsSelection(
        selectableTickets.map((ticket) => ticket.id)
      )
    );
  };

  const handleStatusChange = async (
    ticket: Ticket,
    status: TicketStatus
  ) => {
    try {
      setStatusError("");
      setUpdatingTicketId(ticket.id);
      await onUpdate(ticket.id, { ...ticket, status });
    } catch {
      setStatusError("Unable to update ticket status. Please try again.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleAssignmentChange = async (
    ticket: Ticket,
    assignedTo: string
  ) => {
    try {
      setAssignmentError("");
      setAssigningTicketId(ticket.id);
      await onUpdate(ticket.id, { ...ticket, assignedTo });
    } catch {
      setAssignmentError("Unable to assign ticket. Please try again.");
    } finally {
      setAssigningTicketId(null);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedTickets.length === 0) return;

    try {
      setBulkError("");
      setBulkUpdating(true);

      for (const ticket of selectedTickets) {
        await onUpdate(ticket.id, {
          ...ticket,
          status: bulkStatus
        });
      }

      dispatch(clearSelectedTickets());
    } catch {
      setBulkError("Some tickets could not be updated. Please try again.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedTickets.length === 0 || !bulkAssignedTo) return;

    try {
      setBulkError("");
      setBulkUpdating(true);

      for (const ticket of selectedTickets) {
        await onUpdate(ticket.id, {
          ...ticket,
          assignedTo: bulkAssignedTo
        });
      }

      dispatch(clearSelectedTickets());
      setBulkAssignedTo("");
    } catch {
      setBulkError("Some tickets could not be assigned. Please try again.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedTickets.length} selected ticket(s)?`
    );

    if (!confirmed) return;

    try {
      setBulkError("");
      setBulkUpdating(true);

      for (const ticket of selectedTickets) {
        await onDelete(ticket, true);
      }

      dispatch(clearSelectedTickets());
    } catch {
      setBulkError("Some tickets could not be deleted. Please try again.");
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {statusError && (
        <p className="px-5 py-3 text-sm text-rose-600" role="alert">
          {statusError}
        </p>
      )}

      {assignmentError && (
        <p className="px-5 py-3 text-sm text-rose-600" role="alert">
          {assignmentError}
        </p>
      )}

      {canUseBulkActions && selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-violet-50 px-5 py-4 sm:flex-row sm:items-center sm:flex-wrap">
          <span className="text-xs font-semibold text-violet-800">
            {selectedTickets.length} selected
          </span>

          {canUpdateTicketStatus && (
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(event) =>
                  setBulkStatus(event.target.value as TicketStatus)
                }
                aria-label="Bulk status"
                disabled={bulkUpdating}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                {ticketStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void handleBulkStatusUpdate()}
                disabled={bulkUpdating || selectedTickets.length === 0}
                className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {bulkUpdating ? "Processing..." : "Update status"}
              </button>
            </div>
          )}

          {canAssignTickets && (
            <div className="flex items-center gap-2">
              <select
                value={bulkAssignedTo}
                onChange={(event) => setBulkAssignedTo(event.target.value)}
                aria-label="Bulk assign agent"
                disabled={bulkUpdating}
                className="max-w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <option value="">Select support agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void handleBulkAssignment()}
                disabled={
                  bulkUpdating ||
                  !bulkAssignedTo ||
                  selectedTickets.length === 0
                }
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkUpdating ? "Processing..." : "Assign tickets"}
              </button>
            </div>
          )}

          {canDeleteTicket && (
            <button
              type="button"
              onClick={() => void handleBulkDelete()}
              disabled={bulkUpdating || selectedTickets.length === 0}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              Delete selected
            </button>
          )}

          <button
            type="button"
            onClick={() => dispatch(clearSelectedTickets())}
            disabled={bulkUpdating}
            className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50 sm:ml-auto"
          >
            Clear selection
          </button>

          {bulkError && (
            <p className="w-full text-xs text-rose-600" role="alert">
              {bulkError}
            </p>
          )}
        </div>
      )}

      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="bg-slate-50">
          <tr>
            {canUseBulkActions && (
              <th className="w-12 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all tickets on this page"
                  className="size-4 rounded border-slate-300 accent-violet-600"
                />
              </th>
            )}

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Ticket
            </th>

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Customer
            </th>

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Priority
            </th>

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>

            {canAssignTickets && (
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Assigned Agent
              </th>
            )}

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Created
            </th>

            {showActions && (
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="transition hover:bg-violet-50/40">
              {canUseBulkActions && (
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ticket.id)}
                    onChange={() => toggleTicket(ticket.id)}
                    aria-label={`Select ${ticket.subject}`}
                    className="size-4 rounded border-slate-300 accent-violet-600"
                  />
                </td>
              )}

              <td className="px-5 py-4">
                <p className="text-xs font-semibold text-violet-700">
                  {ticket.id}
                </p>
                <p className="mt-1 max-w-xs truncate text-xs text-slate-700">
                  {ticket.subject}
                </p>
              </td>

              <td className="px-5 py-4">
                <p className="text-xs font-medium text-slate-700">
                  {ticket.customerName}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {ticket.email}
                </p>
              </td>

              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    ticket.priority === "High"
                      ? "bg-rose-50 text-rose-700"
                      : ticket.priority === "Medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {ticket.priority}
                </span>
              </td>

              <td className="px-5 py-4">
                {canUpdateTicketStatus && !canEditTicket ? (
                  <select
                    value={ticket.status}
                    disabled={updatingTicketId === ticket.id}
                    onChange={(event) =>
                      void handleStatusChange(
                        ticket,
                        event.target.value as TicketStatus
                      )
                    }
                    aria-label={`Update status for ${ticket.subject}`}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 disabled:opacity-50"
                  >
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      ticket.status === "Open"
                        ? "bg-blue-50 text-blue-700"
                        : ticket.status === "In Progress"
                          ? "bg-violet-50 text-violet-700"
                          : ticket.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {ticket.status}
                  </span>
                )}
              </td>

              {canAssignTickets && (
                <td className="px-5 py-4">
                  <select
                    value={ticket.assignedTo ?? ""}
                    disabled={assigningTicketId === ticket.id}
                    onChange={(event) =>
                      void handleAssignmentChange(ticket, event.target.value)
                    }
                    aria-label={`Assign ${ticket.subject}`}
                    className="max-w-40 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </td>
              )}

              <td className="px-5 py-4 text-xs text-slate-500">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>

              {showActions && (
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-3">
                    {canEditTicket && (
                      <button
                        type="button"
                        onClick={() => onEdit(ticket)}
                        className="text-xs font-medium text-violet-700 hover:text-violet-900"
                      >
                        Edit
                      </button>
                    )}

                    {canDeleteTicket && (
                      <button
                        type="button"
                        onClick={() => onDelete(ticket)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}