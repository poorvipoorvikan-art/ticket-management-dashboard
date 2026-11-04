import { Formik, Form, Field, ErrorMessage } from "formik";
import type { Ticket, TicketFormData } from "../types/ticket.types";
import { ticketValidationSchema } from "../utils/validation";

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

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const labelClassName = "text-xs font-semibold text-slate-700";

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
          <div className="grid gap-2">
            <label htmlFor="customerName" className={labelClassName}>
              Customer Name
            </label>
            <Field
              id="customerName"
              name="customerName"
              type="text"
              placeholder="Enter customer name"
              className={fieldClassName}
            />
            <ErrorMessage
              name="customerName"
              component="p"
              className="text-xs text-rose-600"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className={labelClassName}>
              Email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              className={fieldClassName}
            />
            <ErrorMessage
              name="email"
              component="p"
              className="text-xs text-rose-600"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="subject" className={labelClassName}>
              Subject
            </label>
            <Field
              id="subject"
              name="subject"
              type="text"
              placeholder="Enter ticket subject"
              className={fieldClassName}
            />
            <ErrorMessage
              name="subject"
              component="p"
              className="text-xs text-rose-600"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className={labelClassName}>
              Description
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the issue"
              className={`${fieldClassName} resize-y`}
            />
            <ErrorMessage
              name="description"
              component="p"
              className="text-xs text-rose-600"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="priority" className={labelClassName}>
                Priority
              </label>
              <Field
                as="select"
                id="priority"
                name="priority"
                className={fieldClassName}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Field>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className={labelClassName}>
                Status
              </label>
              <Field
                as="select"
                id="status"
                name="status"
                className={fieldClassName}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : initialTicket
                  ? "Update Ticket"
                  : "Create Ticket"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}