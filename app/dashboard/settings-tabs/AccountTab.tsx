"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";

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
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ✅ Guard: Don't render if store is still loading
  if (!store) {
    return (
      <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
        <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
          <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
            <User className="w-5 h-5" />
            {tr.accountSettings}
          </h3>
        </div>
        <div className="p-6 flex items-center justify-center py-12">
          <div className="text-sm text-[rgb(60_28_84)]/50">
            {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  const handleChangePassword = async () => {
    // Validation
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordMessage({
        text:
          lang === "ar" ? "الرجاء ملء جميع الحقول" : "Please fill all fields",
        type: "error",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        text:
          lang === "ar"
            ? "كلمات المرور الجديدة غير متطابقة"
            : "Passwords don't match",
        type: "error",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        text:
          lang === "ar"
            ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
            : "Password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (lang === "ar"
              ? "فشل تغيير كلمة المرور"
              : "Failed to change password"),
        );
      }

      setPasswordMessage({
        text:
          lang === "ar"
            ? "تم تغيير كلمة المرور بنجاح!"
            : "Password changed successfully!",
        type: "success",
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (error: any) {
      setPasswordMessage({
        text: error.message,
        type: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info Section */}
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

      {/* Change Password Section */}
      <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
        <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
          <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
          </h3>
          <p className="text-sm text-[rgb(60_28_84)]/60 mt-2">
            {lang === "ar"
              ? "تحديث كلمة مرورك بانتظام يحافظ على حسابك آمناً"
              : "Keep your account secure by updating your password regularly"}
          </p>
        </div>
        <div className="p-6 space-y-5">
          {passwordMessage && (
            <div
              className={`flex items-center gap-3 p-4 rounded-sm ${
                passwordMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <p
                className={`text-sm font-semibold ${
                  passwordMessage.type === "success"
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {passwordMessage.text}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
              {lang === "ar" ? "كلمة المرور الحالية" : "Current Password"}
            </label>
            <div className="relative" dir={dir}>
              <input
                type={showOldPassword ? "text" : "password"}
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                placeholder={
                  lang === "ar"
                    ? "أدخل كلمة المرور الحالية"
                    : "Enter current password"
                }
                className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all pe-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)] transition-colors"
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                {lang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <div className="relative" dir={dir}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder={
                    lang === "ar"
                      ? "أدخل كلمة مرور جديدة"
                      : "Enter new password"
                  }
                  className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)] transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>
              <div className="relative" dir={dir}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder={
                    lang === "ar" ? "أعد كتابة كلمة المرور" : "Confirm password"
                  }
                  className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold text-white bg-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/90 disabled:opacity-50 transition-all"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {lang === "ar" ? "جاري التحديث..." : "Updating..."}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {lang === "ar" ? "تحديث كلمة المرور" : "Update Password"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
