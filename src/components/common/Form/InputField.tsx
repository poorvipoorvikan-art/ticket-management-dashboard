import { Field, ErrorMessage } from "formik";
import type { HTMLInputTypeAttribute } from "react";

interface InputFieldProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
}

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const labelClassName = "text-xs font-semibold text-slate-700";

export default function InputField({
  name,
  label,
  type = "text",
  placeholder
}: InputFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>

      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={fieldClassName}
      />

      <ErrorMessage
        name={name}
        component="p"
        className="text-xs text-rose-600"
      />
    </div>
  );
}