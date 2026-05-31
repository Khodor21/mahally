type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: Props) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-dark mb-2 block">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-12 rounded-2xl bg-brand-grey border border-brand-light px-4 text-sm outline-none focus:border-brand-dark transition-all text-brand-dark"
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
