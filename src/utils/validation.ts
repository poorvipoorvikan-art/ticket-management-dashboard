import * as Yup from "yup";

export const ticketValidationSchema = Yup.object({
  customerName: Yup.string()
    .trim()
    .required("Customer name is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  subject: Yup.string()
    .trim()
    .required("Subject is required"),

  description: Yup.string()
    .trim()
    .required("Description is required"),

  priority: Yup.string()
    .oneOf(["Low", "Medium", "High"])
    .required("Priority is required"),

  status: Yup.string()
    .oneOf(["Open", "In Progress", "Resolved", "Closed"])
    .required("Status is required")
});