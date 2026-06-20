import { Bell, Loader2 } from "lucide-react";

interface NotificationsTabProps {
  lang: string;
  notificationTitle: string;
  setNotificationTitle: (value: string) => void;
  notificationMessage: string;
  setNotificationMessage: (value: string) => void;
  sendingNotification: boolean;
  handleSendNotification: () => Promise<void>;
}

export default function NotificationsTab({
  lang,
  notificationTitle,
  setNotificationTitle,
  notificationMessage,
  setNotificationMessage,
  sendingNotification,
  handleSendNotification,
}: NotificationsTabProps) {
  return (
    <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
      <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
        <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {lang === "ar" ? "إشعارات" : "Notifications"}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-5">
          <div>
            <label className="block text-sm font-medium text-[rgb(60_28_84)] mb-2">
              {lang === "ar" ? "عنوان الإشعار" : "Notification Title"}
            </label>

            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "مثال: خصم 20% على جميع المنتجات"
                  : "Example: 20% Off All Products"
              }
              className="w-full h-12 px-4 rounded-sm border border-[rgb(244_242_245)] focus:outline-none focus:ring-2 focus:ring-[rgb(60_28_84)]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(60_28_84)] mb-2">
              {lang === "ar" ? "محتوى الإشعار" : "Notification Message"}
            </label>

            <textarea
              rows={5}
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "اكتب الرسالة التي ستصل لعملائك..."
                  : "Write the message that will be sent to your customers..."
              }
              className="w-full px-4 py-3 rounded-sm border border-[rgb(244_242_245)] resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(60_28_84)]/20"
            />
          </div>
        </div>

        <div className="bg-[rgb(244_242_245)]/50 rounded-sm p-4">
          <p className="text-sm text-[rgb(60_28_84)]/70">
            {lang === "ar"
              ? "سيتم إرسال هذا الإشعار فقط إلى العملاء المسجلين والذين سمحوا باستقبال الإشعارات."
              : "This notification will only be sent to registered customers who allowed push notifications."}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSendNotification}
            disabled={
              sendingNotification ||
              !notificationTitle.trim() ||
              !notificationMessage.trim()
            }
            className="h-12 px-6 rounded-sm bg-[rgb(60_28_84)] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />

            {sendingNotification
              ? lang === "ar"
                ? "جاري الإرسال..."
                : "Sending..."
              : lang === "ar"
                ? "إرسال الإشعار"
                : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}
