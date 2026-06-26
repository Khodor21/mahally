"use client";

import { useState } from "react";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import InputField from "./InputField";
import SelectField from "./SelectField";
import InfoCard from "./InfoCard";

type Props = {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    governorate: string;
  };
  lang: "en" | "ar";
  loading?: boolean;
  onUpdate?: (data: any) => Promise<void>;
};

const translations = {
  en: {
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    governorate: "Governorate",
    currentPassword: "Current Password",
    newPassword: "New Password",
    optional: "Optional",
    selectGovernorate: "Select Governorate",
    edit: "Edit",
    save: "Save Changes",
    cancel: "Cancel",
    saving: "Saving...",
  },
  ar: {
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    governorate: "المحافظة",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    optional: "اختياري",
    selectGovernorate: "اختر المحافظة",
    edit: "تعديل",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
  },
};

const governorates = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
];

export default function AccountSection({
  customer,
  lang,
  loading = false,
  onUpdate,
}: Props) {
  const tr = translations[lang] as any;
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    firstName: customer.first_name,
    lastName: customer.last_name,
    phone: customer.phone,
    governorate: customer.governorate,
    currentPassword: "",
    newPassword: "",
  });

  async function handleUpdate() {
    if (onUpdate) {
      await onUpdate(form);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Personal Information
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Update your account details
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="h-10 px-4 rounded-lg sm:rounded-xl bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
          >
            <Edit2 size={16} />
            {tr.edit}
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <InfoCard label={tr.firstName} value={customer.first_name} />
          <InfoCard label={tr.lastName} value={customer.last_name} />
          <InfoCard label={tr.phoneNumber} value={customer.phone} />
          <InfoCard label={tr.governorate} value={customer.governorate} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <InputField
              required
              label={tr.firstName}
              value={form.firstName}
              onChange={(v) => setForm((prev) => ({ ...prev, firstName: v }))}
            />
            <InputField
              required
              label={tr.lastName}
              value={form.lastName}
              onChange={(v) => setForm((prev) => ({ ...prev, lastName: v }))}
            />
            <InputField
              required
              label={tr.phoneNumber}
              value={form.phone}
              onChange={(v) => setForm((prev) => ({ ...prev, phone: v }))}
            />
            <SelectField
              required
              options={governorates}
              label={tr.governorate}
              value={form.governorate}
              placeholder={tr.selectGovernorate}
              onChange={(v) => setForm((prev) => ({ ...prev, governorate: v }))}
            />
            <InputField
              type="password"
              label={`${tr.currentPassword} (${tr.optional})`}
              value={form.currentPassword}
              onChange={(v) =>
                setForm((prev) => ({ ...prev, currentPassword: v }))
              }
            />
            <InputField
              type="password"
              label={`${tr.newPassword} (${tr.optional})`}
              value={form.newPassword}
              onChange={(v) => setForm((prev) => ({ ...prev, newPassword: v }))}
            />
          </div>

          <div className="flex gap-3">
            <button
              disabled={loading}
              onClick={() => {
                setIsEditing(false);
                setForm({
                  firstName: customer.first_name,
                  lastName: customer.last_name,
                  phone: customer.phone,
                  governorate: customer.governorate,
                  currentPassword: "",
                  newPassword: "",
                });
              }}
              className="flex-1 h-10 px-4 rounded-lg sm:rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X size={16} />
              {tr.cancel}
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 h-10 px-4 rounded-lg sm:rounded-xl bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {tr.saving}
                </>
              ) : (
                <>
                  <Check size={16} />
                  {tr.save}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
