import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TicketForm from "./TicketForm";
import type { Ticket, TicketFormData } from "../types/ticket.types";

afterEach(() => {
    cleanup();
});

const mockTicket: Ticket = {
    id: "TKT-101",
    customerName: "Asha Rao",
    email: "asha@example.com",
    subject: "Unable to log in",
    description: "Login fails after entering credentials.",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-01T10:00:00.000Z",
    assignedTo: "agent-1"
};

const validFormData: TicketFormData = {
    customerName: "Ravi Kumar",
    email: "ravi@example.com",
    subject: "Payment issue",
    description: "My payment was deducted but the order was not placed.",
    priority: "Medium",
    status: "Open"
};

describe("TicketForm", () => {
    it("renders all form fields", () => {
        render(
            <TicketForm
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByLabelText("Customer Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Subject")).toBeInTheDocument();
        expect(screen.getByLabelText("Description")).toBeInTheDocument();
        expect(screen.getByLabelText("Priority")).toBeInTheDocument();
        expect(screen.getByLabelText("Status")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Create Ticket" })).toBeInTheDocument();
    });

    it("calls onCancel when Cancel is clicked", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();

        render(
            <TicketForm
                onSubmit={vi.fn()}
                onCancel={onCancel}
            />
        );

        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("submits valid form data", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <TicketForm
                onSubmit={onSubmit}
                onCancel={vi.fn()}
            />
        );

        await user.type(screen.getByLabelText("Customer Name"), validFormData.customerName);
        await user.type(screen.getByLabelText("Email"), validFormData.email);
        await user.type(screen.getByLabelText("Subject"), validFormData.subject);
        await user.type(screen.getByLabelText("Description"), validFormData.description);
        await user.selectOptions(screen.getByLabelText("Priority"), validFormData.priority);
        await user.selectOptions(screen.getByLabelText("Status"), validFormData.status);

        await user.click(screen.getByRole("button", { name: "Create Ticket" }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });

        expect(onSubmit.mock.calls[0][0]).toEqual(validFormData);
    });

    it("shows validation errors when required fields are empty", async () => {
        const user = userEvent.setup();

        render(
            <TicketForm
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        await user.click(screen.getByRole("button", { name: "Create Ticket" }));

        expect(await screen.findByText(/customer name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    it("shows the existing ticket values when editing", () => {
        render(
            <TicketForm
                initialTicket={mockTicket}
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByLabelText("Customer Name")).toHaveValue("Asha Rao");
        expect(screen.getByLabelText("Email")).toHaveValue("asha@example.com");
        expect(screen.getByLabelText("Subject")).toHaveValue("Unable to log in");
        expect(screen.getByLabelText("Description")).toHaveValue(
            "Login fails after entering credentials."
        );
        expect(screen.getByLabelText("Priority")).toHaveValue("High");
        expect(screen.getByLabelText("Status")).toHaveValue("In Progress");
        expect(screen.getByRole("button", { name: "Update Ticket" })).toBeInTheDocument();
    });
});