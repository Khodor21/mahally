"use client";

type Props = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string | number;
};

export default function SidebarItem({
  icon,
  label,
  active,
  danger,
  onClick,
  disabled,
  badge,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 px-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? "bg-brand-primary text-white"
          : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>

      {badge && (
        <span className="ml-auto text-xs font-bold bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
