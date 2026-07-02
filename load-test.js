import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  // ── FIX: Explicit DNS mapping for the local subdomain ──
  hosts: {
    "turs-bookstore.localhost:3000": "127.0.0.1:3000",
  },
  scenarios: {
    checkout_load: {
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
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

// ... the rest of the script remains the same ...

const BASE_URL = "http://turs-bookstore.localhost:3000";
const STORE_ID = "237f4275-12c5-4a16-af27-18a06cffe5d6";

const PRODUCTS = [
  "13e7d00a-fb24-42a2-b6b9-3d9eb5e81b8b",
  "71fd0d37-d16c-4d5e-9988-861a7f382543",
  "ba57533a-c2d9-4f6f-a5cb-c828ae935183",
];

export default function () {
  const randomProductId = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];

  const payload = JSON.stringify({
    storeId: STORE_ID,
    customerName: `Khodor LoadTest ${__VU}`,
    customerPhone: "+96171708103",
    city: "Tripoli",
    address: "Test Address North Governorate",
    shipping: 2,
    couponCode: "",
    items: [
      {
        productId: randomProductId,
        qty: 1,
      },
    ],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Host: "turs-bookstore.localhost:3000", // Ensure port is included here to match middleware expectations
    },
  };

  const res = http.post(`${BASE_URL}/api/checkout`, payload, params);

  check(res, {
    "checkout status is 201": (r) => r.status === 201,
  });

  sleep(1);
}
