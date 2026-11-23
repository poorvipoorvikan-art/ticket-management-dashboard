import { Field } from "formik";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
}

const fieldClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const labelClassName = "text-xs font-semibold text-slate-700";

export default function SelectField({
  name,
  label,
  options
}: SelectFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>

      <Field
        as="select"
        id={name}
        name={name}
        className={fieldClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
    </div>
  );
}