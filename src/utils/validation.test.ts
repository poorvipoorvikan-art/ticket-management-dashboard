import { describe, expect, it } from "vitest";
import { ticketValidationSchema } from "./validation";

const validTicket = {
  customerName: "Poorvi",
  email: "poorvi@example.com",
  subject: "Login issue",
  description: "Unable to log in to my account",
  priority: "Medium",
  status: "Open"
};

describe("ticketValidationSchema", () => {
  it("accepts valid ticket data", async () => {
    await expect(ticketValidationSchema.validate(validTicket)).resolves.toEqual(
      validTicket
    );
  });

  it("rejects a missing customer name", async () => {
    await expect(
      ticketValidationSchema.validate({
        ...validTicket,
        customerName: ""
      })
    ).rejects.toThrow("Customer name is required");
  });

  it("rejects an invalid email address", async () => {
    await expect(
      ticketValidationSchema.validate({
        ...validTicket,
        email: "not-an-email"
      })
    ).rejects.toThrow("Enter a valid email address");
  });

  it("rejects a priority outside the allowed values", async () => {
    await expect(
      ticketValidationSchema.validate({
        ...validTicket,
        priority: "Urgent"
      })
    ).rejects.toThrow();
  });

  it("rejects a status outside the allowed values", async () => {
    await expect(
      ticketValidationSchema.validate({
        ...validTicket,
        status: "Pending"
      })
    ).rejects.toThrow();
  });

  it("trims whitespace from customer name", async () => {
    const result = await ticketValidationSchema.validate({
      ...validTicket,
      customerName: "  Poorvi  "
    });

    expect(result.customerName).toBe("Poorvi");
  });
});