import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  // يمكنك لاحقاً جلب تفاصيل الطلب هنا باستخدام params.id لعرض المنتجات والمبلغ

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm max-w-md w-full text-center border border-gray-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          تم تأكيد طلبك بنجاح!
        </h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          شكراً لتسوقك معنا. سنقوم بتجهيز طلبك بأسرع وقت ممكن.
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
            رقم الطلب
          </p>
          <p className="font-mono text-lg font-bold text-[rgb(60_28_84)]">
            #{params.id.split("-")[0].toUpperCase()}
          </p>
        </div>

        <Link
          href="/"
          className="block w-full bg-[rgb(60_28_84)] text-white py-3 px-4 rounded-xl font-bold hover:bg-[rgb(80_40_110)] transition-colors"
        >
          العودة للتسوق
        </Link>
      </div>
    </div>
  );
}
