import http from "k6/http";
import { check, group } from "k6";

export const options = {
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 50 }, // الصعود التدريجي الأول
        { duration: "2m", target: 150 }, // الصعود التدريجي الثاني
        { duration: "5m", target: 250 }, // مرحلة الثبات (Stress Test الحقيقي)
        { duration: "1m", target: 0 }, // التدرج للنزول
      ],
    },
  },
  thresholds: {
    // نرفع السقف قليلاً لـ p(95) لنرى الواقع، ونركز على نسبة الفشل
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const BASE_URL = "http://localhost:3000";
  const HEADERS = { Host: "perfumes.mahally.app" };

  // 1. اختبار الصفحة الرئيسية
  group("الصفحة الرئيسية", () => {
    const res = http.get(`${BASE_URL}/`, { headers: HEADERS });
    check(res, { "status is 200": (r) => r.status === 200 });
  });

  // 2. اختبار الـ API
  group("API Hero", () => {
    const res = http.get(
      `${BASE_URL}/api/hero?storeId=ade24f06-c292-471e-b766-a9200a3a9b45`,
      { headers: HEADERS },
    );
    check(res, { "status is 200": (r) => r.status === 200 });
  });
}
