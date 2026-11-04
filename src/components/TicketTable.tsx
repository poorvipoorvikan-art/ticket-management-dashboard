import { useState } from "react";
import type { Ticket, TicketFormData, TicketStatus } from "../types/ticket.types";
import { usePermissions } from "../hooks/usePermissions";
import { authService } from "../services/authService";

interface TicketTableProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onUpdate: (id: string, data: TicketFormData) => Promise<Ticket>;
}

export default function TicketTable({
  tickets,
  onEdit,
  onDelete,
  onUpdate
}: TicketTableProps) {
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

  const showActions =
    canEditTicket ||
    canDeleteTicket ||
    canUpdateTicketStatus ||
    canAssignTickets;

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

      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="bg-slate-50">
          <tr>
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
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
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