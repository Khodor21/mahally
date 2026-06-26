type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  error?: string;
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
}: Props) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-semibold text-gray-900 block mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white border px-3 sm:px-4 text-sm outline-none transition-all ${
          error
            ? "border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-100"
            : "border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
        } text-gray-900`}
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
