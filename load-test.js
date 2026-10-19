import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ── Custom Metrics ───────────────────────────────────────────────
const errorRate = new Rate("error_rate");
const checkoutDuration = new Trend("checkout_duration", true);

// ── Config ───────────────────────────────────────────────────────
const BASE_URL = "https://turs-bookstore.mahally.app";
const STORE_ID = "237f4275-12c5-4a16-af27-18a06cffe5d6";

const PRODUCTS = [
  { id: "13e7d00a-fb24-42a2-b6b9-3d9eb5e81b8b", hasVariant: true },
  { id: "386aa804-17eb-452a-98d0-c6736a169486", hasVariant: false },
  { id: "71fd0d37-d16c-4d5e-9988-861a7f382543", hasVariant: false },
];

const CITIES = [
  "البقاع",
  "الجنوب",
  "لبنان الجنوبي",
  "لبنان الشمالي",
  "بيروت",
  "طرابلس",
  "عكار",
];

const PAYMENT_METHODS = ["cash_on_delivery"];

// ── Load Profile ─────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp up
    { duration: "1m", target: 30 }, // normal load
    { duration: "30s", target: 60 }, // stress
    { duration: "30s", target: 10 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // 95% of requests under 3s
    http_req_failed: ["rate<0.05"], // less than 5% errors
    error_rate: ["rate<0.05"],
  },
};

// ── Helpers ──────────────────────────────────────────────────────
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomName() {
  const names = [
    "أحمد محمد",
    "فاطمة علي",
    "محمد حسن",
    "نور الدين",
    "سارة أحمد",
    "علي حسين",
    "مريم خالد",
    "عمر يوسف",
  ];
  return randomFrom(names);
}

function randomPhone() {
  return `+9613${randomInt(100000, 999999)}`;
}

function buildItems() {
  const count = randomInt(1, 3);
  const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((p) => {
    const item = {
      productId: p.id,
      qty: randomInt(1, 2),
    };
    if (p.hasVariant) {
      item.variantSelections = {
        "3292e9b0-e77f-42e7-8968-5d910bd8d6d7": {
          id: "19488b77-086e-4ec6-ae93-e8a627949cbe",
          value: "محمد حسني الندوي",
        },
      };
    }
    return item;
  });
}

// ── Scenarios ────────────────────────────────────────────────────

// 1. Normal checkout
function scenarioNormalCheckout() {
  const payload = JSON.stringify({
    storeId: STORE_ID,
    customerName: randomName(),
    customerEmail: "",
    customerPhone: randomPhone(),
    city: randomFrom(CITIES),
    address: `شارع ${randomInt(1, 100)}`,
    notes: "",
    shipping: randomFrom([0, 2, 3, 5]),
    couponCode: "",
    paymentMethod: randomFrom(PAYMENT_METHODS),
    isGift: false,
    items: buildItems(),
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/checkout`, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { scenario: "normal_checkout" },
  });
  checkoutDuration.add(Date.now() - start);

  const ok = check(res, {
    "checkout 201": (r) => r.status === 201,
    "has orderId": (r) => {
      try {
        return !!JSON.parse(r.body).orderId;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!ok);
  return res;
}

// 2. Concurrent same product (race condition test)
function scenarioConcurrentSameProduct() {
  const payload = JSON.stringify({
    storeId: STORE_ID,
    customerName: randomName(),
    customerEmail: "",
    customerPhone: randomPhone(),
    city: "بيروت",
    address: "شارع الحمرا",
    notes: "",
    shipping: 3,
    couponCode: "",
    paymentMethod: "cash_on_delivery",
    isGift: false,
    items: [{ productId: "386aa804-17eb-452a-98d0-c6736a169486", qty: 1 }],
  });

  const res = http.post(`${BASE_URL}/api/checkout`, payload, {
    headers: { "Content-Type": "application/json" },
    tags: { scenario: "concurrent_same_product" },
  });

  const ok = check(res, {
    "concurrent: 201 or 409": (r) => r.status === 201 || r.status === 409,
    "no 500": (r) => r.status !== 500,
  });
  errorRate.add(!ok);
  return res;
}

// 3. Invalid payload (should 422)
function scenarioInvalidPayload() {
  const res = http.post(
    `${BASE_URL}/api/checkout`,
    JSON.stringify({ storeId: STORE_ID, items: [] }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { scenario: "invalid_payload" },
    },
  );

  const ok = check(res, {
    "invalid: 422": (r) => r.status === 422,
  });
  errorRate.add(!ok);
  return res;
}

// 4. GET orders
function scenarioGetOrders() {
  const res = http.get(`${BASE_URL}/api/checkout?storeId=${STORE_ID}`, {
    tags: { scenario: "get_orders" },
  });

  const ok = check(res, {
    "GET orders 200": (r) => r.status === 200,
  });
  errorRate.add(!ok);
  return res;
}

// ── Main VU ──────────────────────────────────────────────────────
export default function () {
  const roll = Math.random();

  if (roll < 0.5) {
    scenarioNormalCheckout();
  } else if (roll < 0.75) {
    scenarioConcurrentSameProduct();
  } else if (roll < 0.9) {
    scenarioGetOrders();
  } else {
    scenarioInvalidPayload();
  }

  sleep(randomInt(1, 3));
}

// ── Summary ──────────────────────────────────────────────────────
export function handleSummary(data) {
  const reqs = data.metrics.http_reqs?.values?.count ?? 0;
  const failed = data.metrics.http_req_failed?.values?.rate ?? 0;
  const p95 = data.metrics.http_req_duration?.values?.["p(95)"] ?? 0;
  const p99 = data.metrics.http_req_duration?.values?.["p(99)"] ?? 0;
  const errRate = data.metrics.error_rate?.values?.rate ?? 0;
  const avgMs = data.metrics.checkout_duration?.values?.avg ?? 0;

  const summary = `
════════════════════════════════════════
        MAHALLY CHECKOUT LOAD TEST
════════════════════════════════════════
Total Requests  : ${reqs}
Failed Rate     : ${(failed * 100).toFixed(2)}%
Error Rate      : ${(errRate * 100).toFixed(2)}%

Checkout Duration (custom):
  avg : ${avgMs.toFixed(0)}ms
  p95 : ${p95.toFixed(0)}ms
  p99 : ${p99.toFixed(0)}ms

Thresholds:
  p(95) < 3000ms : ${p95 < 3000 ? "✅ PASS" : "❌ FAIL"}
  error < 5%     : ${errRate < 0.05 ? "✅ PASS" : "❌ FAIL"}
════════════════════════════════════════
`;

  console.log(summary);
  return { stdout: summary };
}
