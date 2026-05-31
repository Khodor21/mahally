"use client";

import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  cancelText,
  loading,
  danger,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-[28px] bg-white border border-brand-light shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-brand-dark mb-3">{title}</h2>

        <p className="text-sm leading-7 text-brand-dark/60 mb-6">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-11 px-5 rounded-2xl border border-brand-light text-sm font-medium text-brand-dark hover:bg-brand-grey transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`h-11 px-5 rounded-2xl text-sm font-medium text-white transition-opacity disabled:opacity-50 flex items-center gap-2 ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-brand-dark hover:opacity-90"
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
