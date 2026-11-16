import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TicketTable from "./TicketTable";
import type { Ticket } from "../types/ticket.types";

const mocks = vi.hoisted(() => ({
  permissions: {
    canEditTicket: false,
    canDeleteTicket: false,
    canAssignTickets: false,
    canUpdateTicketStatus: false
  }
}));

vi.mock("../hooks/useAppDispatch", () => ({
  useAppDispatch: () => vi.fn()
}));

vi.mock("../hooks/useAppSelector", () => ({
  useAppSelector: () => []
}));

vi.mock("../hooks/usePermissions", () => ({
  usePermissions: () => mocks.permissions
}));

vi.mock("../services/authService", () => ({
  authService: {
    getSupportAgents: () => [
      { id: "agent-1", name: "Asha Agent" }
    ]
  }
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockTicket: Ticket = {
  id: "TKT-101",
  customerName: "Asha Rao",
  email: "asha@example.com",
  subject: "Unable to log in",
  description: "Login fails after entering credentials.",
  priority: "High",
  status: "Open",
  createdAt: "2026-10-01T10:00:00.000Z",
  assignedTo: "agent-1"
};

const renderTicketTable = (
  permissions: typeof mocks.permissions,
  onEdit = vi.fn(),
  onDelete = vi.fn().mockResolvedValue(undefined),
  onUpdate = vi.fn().mockResolvedValue(mockTicket),
  ticket: Ticket = mockTicket
) => {
  Object.assign(mocks.permissions, permissions);

  render(
    <TicketTable
      tickets={[ticket]}
      allTickets={[ticket]}
      onEdit={onEdit}
      onDelete={onDelete}
      onUpdate={onUpdate}
    />
  );

  return { onEdit, onDelete, onUpdate };
};

describe("TicketTable security", () => {
  beforeEach(() => {
    Object.assign(mocks.permissions, {
      canEditTicket: false,
      canDeleteTicket: false,
      canAssignTickets: false,
      canUpdateTicketStatus: false
    });
  });

  it("allows Administrator to edit, delete and assign tickets", () => {
    renderTicketTable({
      canEditTicket: true,
      canDeleteTicket: true,
      canAssignTickets: true,
      canUpdateTicketStatus: true
    });

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Assign Unable to log in" })
    ).toBeInTheDocument();
  });

  it("allows Support Manager to edit and assign but not delete tickets", () => {
    renderTicketTable({
      canEditTicket: true,
      canDeleteTicket: false,
      canAssignTickets: true,
      canUpdateTicketStatus: true
    });

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Assign Unable to log in" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("prevents Support Agent from editing, deleting or assigning tickets", () => {
    renderTicketTable({
      canEditTicket: false,
      canDeleteTicket: false,
      canAssignTickets: false,
      canUpdateTicketStatus: true
    });

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Assign Unable to log in" })
    ).not.toBeInTheDocument();
  });

  it("allows Support Agent to update ticket status", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderTicketTable({
      canEditTicket: false,
      canDeleteTicket: false,
      canAssignTickets: false,
      canUpdateTicketStatus: true
    });

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Update status for Unable to log in"
      }),
      "Resolved"
    );

    expect(onUpdate).toHaveBeenCalledWith(
      "TKT-101",
      expect.objectContaining({
        status: "Resolved"
      })
    );
  });

  it("calls onDelete when Administrator deletes a ticket", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderTicketTable({
      canEditTicket: true,
      canDeleteTicket: true,
      canAssignTickets: true,
      canUpdateTicketStatus: true
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith(mockTicket, false);
  });

  it("allows Support Manager to assign a ticket", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderTicketTable({
      canEditTicket: true,
      canDeleteTicket: false,
      canAssignTickets: true,
      canUpdateTicketStatus: true
    });

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Assign Unable to log in"
      }),
      "agent-1"
    );

    expect(onUpdate).toHaveBeenCalledWith(
      "TKT-101",
      expect.objectContaining({
        assignedTo: "agent-1"
      })
    );
  });

  it("displays tickets to all permitted roles", () => {
    renderTicketTable({
      canEditTicket: false,
      canDeleteTicket: false,
      canAssignTickets: false,
      canUpdateTicketStatus: true
    });

    expect(screen.getByText("TKT-101")).toBeInTheDocument();
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("Unable to log in")).toBeInTheDocument();
  });

  it("renders malicious ticket input as plain text without creating HTML elements", () => {
    const maliciousName = "<img src=x onerror=alert('XSS')>";
    const maliciousSubject = "<script>alert('XSS')</script>";

    const maliciousTicket: Ticket = {
      ...mockTicket,
      customerName: maliciousName,
      subject: maliciousSubject
    };

    const { container } = render(
      <TicketTable
        tickets={[maliciousTicket]}
        allTickets={[maliciousTicket]}
        onEdit={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(undefined)}
        onUpdate={vi.fn().mockResolvedValue(maliciousTicket)}
      />
    );

    expect(container.textContent).toContain(maliciousName);
    expect(container.textContent).toContain(maliciousSubject);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });
});