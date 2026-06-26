type Props = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export default function InfoCard({ label, value, icon }: Props) {
  return (
    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        {icon && <span className="text-brand-primary">{icon}</span>}
        <p className="text-xs sm:text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900">
        {value}
      </h3>
    </div>
  );
}
