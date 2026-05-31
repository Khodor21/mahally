"use client";

type Props = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export default function SidebarItem({
  icon,
  label,
  active,
  danger,
  onClick,
  disabled,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 px-4 rounded-2xl flex items-center gap-3 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? "bg-brand-dark text-white"
          : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-brand-dark hover:bg-brand-grey"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
