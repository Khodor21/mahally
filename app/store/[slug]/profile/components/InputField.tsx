type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: Props) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-dark mb-2 block">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-12 rounded-2xl bg-brand-grey border border-brand-light px-4 text-sm outline-none focus:border-brand-dark transition-all text-brand-dark"
      />
    </div>
  );
}
