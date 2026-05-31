type Props = {
  label: string;
  value: string;
};

export default function InfoCard({ label, value }: Props) {
  return (
    <div className="bg-brand-grey/40 rounded-2xl p-4">
      <p className="text-xs text-brand-dark/50 mb-1">{label}</p>
      <h3 className="text-sm font-semibold text-brand-dark">{value}</h3>
    </div>
  );
}
