import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "https://turs-bookstore.mahally.app";

export const options = {
  stages: [
    { duration: "20s", target: 50 }, // محاكاة دخول مفاجئ لـ 50 مستخدم
    { duration: "1m", target: 50 }, // استقرار العدد لمدة دقيقة للتصفح
    { duration: "20s", target: 0 }, // خروج المستخدمين تدريجياً
  ],
  thresholds: {
    // تحميل صفحة الـ HTML بالكامل يجب أن يكون تحت 1.5 ثانية (الواجهات الأمامية أثقل من الـ APIs)
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // محاكاة طلب فتح الصفحة الرئيسية للمتجر
  const response = http.get(BASE_URL);

  // التحقق من نجاح تحميل الصفحة وأن الاستجابة هي HTML وليست خطأ برمجي
  check(response, {
    "Status 200": (r) => r.status === 200,
    "Is HTML Document": (r) =>
      r.headers["Content-Type"] &&
      r.headers["Content-Type"].includes("text/html"),
  });

  // محاكاة بقاء المستخدم في الصفحة الرئيسية لمدة ثانية لقراءة المحتوى قبل أي إجراء آخر
  sleep(1);
}
