"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Store,
  User,
  Bell,
  Globe,
  AlertTriangle,
  Check,
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import { STORE_TYPE_LABELS } from "../data";

type StoreData = {
  id: string;
  admin_name: string;
  admin_email: string;
  store_name: string;
  slug: string;
  location: string | null;
  phone: string | null;
  store_type: string | null;
  created_at: string;
  is_active: boolean;
};

export default function SettingsPanel() {
  const { tr, lang, setLang } = useDashboard();

  const dir = lang === "ar" ? "rtl" : "ltr";

  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);

  const [store, setStore] = useState<StoreData | null>(null);

  const [activeTab, setActiveTab] = useState<
    "store" | "account" | "notifications" | "appearance"
  >("store");

  const [formData, setFormData] = useState({
    store_name: "",
    location: "",
    phone: "",
    store_type: "",
    admin_name: "",
    admin_email: "",
  });

  async function fetchStore() {
    try {
      setLoading(true);

      const res = await fetch("/api/stores", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.store) {
        return;
      }

      setStore(data.store);

      setFormData({
        store_name: data.store.store_name || "",
        location: data.store.location || "",
        phone: data.store.phone || "",
        store_type: data.store.store_type || "",
        admin_name: data.store.admin_name || "",
        admin_email: data.store.admin_email || "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStore();
  }, []);

  const handleSave = async () => {
    try {
      setSaved(false);

      // later:
      // await fetch("/api/stores", {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });

      setSaved(true);

      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { id: "store" as const, label: tr.storeSettings, icon: Store },
    { id: "account" as const, label: tr.accountSettings, icon: User },
    {
      id: "notifications" as const,
      label: tr.notificationSettings,
      icon: Bell,
    },
    { id: "appearance" as const, label: tr.appearance, icon: Globe },
  ];

  const createdDate = store?.created_at
    ? new Date(store.created_at).toLocaleDateString(
        lang === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )
    : "";

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-10 text-center text-sm text-[rgb(60_28_84)]/50"
        dir={dir}
      >
        Loading...
      </div>
    );
  }

  if (!store) {
    return (
      <div
        className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-10 text-center text-sm text-red-500"
        dir={dir}
      >
        Failed to load store data
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl" dir={dir}>
      {/* Tabs */}
      <div className="flex gap-1 bg-[rgb(244_242_245)] rounded-xl p-1 animate-fade-up">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-white text-[rgb(60_28_84)] shadow-sm"
                : "text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)]"
            }`}
          >
            <tab.icon className="w-4 h-4" />

            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === "store" && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <Store className="w-5 h-5" />

              {tr.storeSettings}
            </h3>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  label: tr.storeName,
                  key: "store_name",
                  type: "text",
                },
                {
                  label: tr.location,
                  key: "location",
                  type: "text",
                },
                {
                  label: tr.phone,
                  key: "phone",
                  type: "tel",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                    {field.label}
                  </label>

                  <input
                    type={field.type}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir={dir}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                  {tr.storeType}
                </label>

                <select
                  value={formData.store_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      store_type: e.target.value,
                    }))
                  }
                  className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                  dir={dir}
                >
                  {Object.entries(STORE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {lang === "ar" ? v.ar : v.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Store readonly info */}
            <div className="pt-4 border-t border-[rgb(244_242_245)] grid md:grid-cols-2 gap-4">
              <div className="bg-[rgb(244_242_245)] rounded-xl px-4 py-3">
                <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">
                  {tr.storeId}
                </p>

                <p className="text-sm font-bold text-[rgb(60_28_84)] font-mono">
                  #{store.id.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="bg-[rgb(244_242_245)] rounded-xl px-4 py-3">
                <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">
                  {tr.memberSince}
                </p>

                <p className="text-sm font-bold text-[rgb(60_28_84)]">
                  {createdDate}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
                saved
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90 shadow-[rgb(60_28_84)]/20"
              }`}
            >
              {saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}

              {saved
                ? lang === "ar"
                  ? "تم الحفظ!"
                  : "Saved!"
                : tr.saveChanges}
            </button>
          </div>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === "account" && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <User className="w-5 h-5" />

              {tr.accountSettings}
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgb(60_28_84)] flex items-center justify-center text-white font-bold text-2xl">
                {store.admin_name?.[0]}
              </div>

              <div>
                <p className="font-bold text-[rgb(60_28_84)]">
                  {store.admin_name}
                </p>

                <p className="text-sm text-[rgb(60_28_84)]/50">
                  {store.admin_email}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  label: tr.adminName,
                  key: "admin_name",
                },
                {
                  label: tr.email,
                  key: "admin_email",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                    {field.label}
                  </label>

                  <input
                    type="text"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir={dir}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20"
            >
              <Save className="w-4 h-4" />

              {tr.saveChanges}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}