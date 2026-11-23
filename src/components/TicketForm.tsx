import { Formik, Form } from "formik";
import type { Ticket, TicketFormData } from "../types/ticket.types";
import { ticketValidationSchema } from "../utils/validation";
import {
  InputField,
  TextAreaField,
  SelectField,
  FormActions
} from "./common/Form";

interface TicketFormProps {
  initialTicket?: Ticket | null;
  onSubmit: (data: TicketFormData) => Promise<void>;
  onCancel: () => void;
}

const initialValues: TicketFormData = {
  customerName: "",
  email: "",
  subject: "",
  description: "",
  priority: "Medium",
  status: "Open"
};

export default function TicketForm({
  initialTicket,
  onSubmit,
  onCancel
}: TicketFormProps) {
  const values: TicketFormData = initialTicket
    ? {
        customerName: initialTicket.customerName,
        email: initialTicket.email,
        subject: initialTicket.subject,
        description: initialTicket.description,
        priority: initialTicket.priority,
        status: initialTicket.status
      }
    : initialValues;

  return (
    <Formik
      initialValues={values}
      validationSchema={ticketValidationSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="grid gap-5">
          <InputField
            name="customerName"
            label="Customer Name"
            placeholder="Enter customer name"
          />

          <InputField
            name="email"
            label="Email"
            type="email"
            placeholder="Enter email address"
          />

          <InputField
            name="subject"
            label="Subject"
            placeholder="Enter ticket subject"
          />

          <TextAreaField
            name="description"
            label="Description"
            placeholder="Describe the issue"
            rows={4}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="priority"
              label="Priority"
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" }
              ]}
            />

            <SelectField
              name="status"
              label="Status"
              options={[
                { label: "Open", value: "Open" },
                { label: "In Progress", value: "In Progress" },
                { label: "Resolved", value: "Resolved" },
                { label: "Closed", value: "Closed" }
              ]}
            />
          </div>

          <FormActions
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            submitLabel={initialTicket ? "Update Ticket" : "Create Ticket"}
          />
        </Form>
      )}
    </Formik>
  );
}