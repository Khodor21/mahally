import { User } from "lucide-react";

interface AccountTabProps {
  lang: string;
  dir: string;
  tr: any;
  store: any;
  formData: any;
  setFormData: (data: any) => void;
  SaveButton: React.ComponentType;
}

export default function AccountTab({
  lang,
  dir,
  tr,
  store,
  formData,
  setFormData,
  SaveButton,
}: AccountTabProps) {
  return (
    <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
      <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
        <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
          <User className="w-5 h-5" />
          {tr.accountSettings}
        </h3>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-sm bg-[rgb(60_28_84)] flex items-center justify-center text-white font-bold text-2xl">
            {store.admin_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-[rgb(60_28_84)]">{store.admin_name}</p>
            <p className="text-sm text-[rgb(60_28_84)]/50">
              {store.admin_email}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {[
            { label: tr.adminName, key: "admin_name" },
            { label: tr.email, key: "admin_email" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                {field.label}
              </label>
              <input
                type="text"
                value={formData[field.key]}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                dir={dir}
              />
            </div>
          ))}
        </div>

        <SaveButton />
      </div>
    </div>
  );
}
