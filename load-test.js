import http from "k6/http";
import { check, group } from "k6";

export const options = {
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 },
        { duration: "3m", target: 100 },
        { duration: "4m", target: 100 },
        { duration: "1m", target: 0 },
      ],
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = "http://localhost:3000";

const STORES = [
  {
    host: "afnan.mahally.app",
    storeId: "116ae630-b5d5-4d78-9710-c38554f119d5",
  },
  {
    host: "perfumes.mahally.app",
    storeId: "ade24f06-c292-471e-b766-a9200a3a9b45",
  },
];

export default function () {
  const store = STORES[Math.floor(Math.random() * STORES.length)];

  const headers = {
    Host: store.host,
  };

  group(`Homepage - ${store.host}`, () => {
    const res = http.get(`${BASE_URL}/`, {
      headers,
    });

    check(res, {
      "homepage status 200": (r) => r.status === 200,
    });
  });

  group(`Hero API - ${store.host}`, () => {
    const res = http.get(`${BASE_URL}/api/hero?storeId=${store.storeId}`, {
      headers,
    });

    check(res, {
      "hero api status 200": (r) => r.status === 200,
    });
  });
}
