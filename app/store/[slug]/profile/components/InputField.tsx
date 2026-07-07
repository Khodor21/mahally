type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
};

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  error,
}: Props) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-medium text-gray-900 block mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white border px-3 sm:px-4 text-sm outline-none transition-all ${
          error
            ? "border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-100"
            : "border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
        } text-gray-900 placeholder-gray-400`}
      />

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
