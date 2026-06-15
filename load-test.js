import http from "k6/http";
import { check, group } from "k6";

export const options = {
  // نفس الإعدادات السابقة لضغط الـ 250 مستخدم
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 25 },
        { duration: "1m", target: 125 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const BASE_URL = "https://perfumes.mahally.app";

  // 1. اختبار الصفحة الرئيسية (التي تعاني من البطء)
  group("الصفحة الرئيسية (HTML)", () => {
    const res = http.get(`${BASE_URL}`); // استبدل your-store-slug برابط متجر حقيقي
    check(res, {
      "Page status is 200": (r) => r.status === 200,
    });
  });

  // 2. اختبار الـ API الخاص بـ Hero (لنرى هل هو سريع أم بطيء)
  group("API Hero Section", () => {
    const res = http.get(
      `${BASE_URL}/api/hero?storeId=ade24f06-c292-471e-b766-a9200a3a9b45`,
    );
    check(res, {
      "API status is 200": (r) => r.status === 200,
    });
  });
}
