import * as Yup from "yup";

export const ticketValidationSchema = Yup.object({
  customerName: Yup.string()
    .trim()
    .required("Customer name is required")
    .min(2, "Customer name must contain at least 2 characters")
    .max(80, "Customer name cannot exceed 80 characters"),

  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address")
    .max(254, "Email cannot exceed 254 characters"),

  subject: Yup.string()
    .trim()
    .required("Subject is required")
    .min(5, "Subject must contain at least 5 characters")
    .max(120, "Subject cannot exceed 120 characters"),

  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(10, "Description must contain at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  priority: Yup.string()
    .required("Priority is required")
    .oneOf(
      ["Low", "Medium", "High"],
      "Select a valid priority"
    ),

  status: Yup.string()
    .required("Status is required")
    .oneOf(
      ["Open", "In Progress", "Resolved", "Closed"],
      "Select a valid status"
    )
}).noUnknown(true, "Unexpected fields are not allowed");