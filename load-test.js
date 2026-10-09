import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ─────────────────────────────────────────
//  Custom Metrics
// ─────────────────────────────────────────
const ordersSubmitted = new Counter("orders_submitted");
const ordersFailed = new Counter("orders_failed");
const ordersSuccessRate = new Rate("orders_success_rate");
const checkoutDuration = new Trend("checkout_duration_ms", true);
const homepageDuration = new Trend("homepage_duration_ms", true);
const productDuration = new Trend("product_page_duration_ms", true);

// ─────────────────────────────────────────
//  Config
// ─────────────────────────────────────────
const BASE_URL = "https://almanhalbooksshop.mahally.app";
const STORE_ID = "63d6245d-900d-486b-9c69-35fcf72a3450"; // ← اتركها فارغة إذا ما عندك UUID، بتشتغل بدونها

// بيانات المنتجات — بدّل الـ productId بالـ UUID الحقيقي من الـ dashboard
const FAKE_PRODUCTS = [
  { productId: "44ac01a4-aff0-48f1-88f7-e98d90cf76a0", name: "Fake1" },
  { productId: "df125512-76b1-4850-aa8c-aa3d6bf897a8", name: "Fake2" },
  { productId: "adf8718e-67ec-4c1f-aff0-f18eb5b79a77", name: "Fake3" },
];

const PAYMENT_METHODS = ["cash_on_delivery", "whish_money"];
const CITIES = [
  "البقاع",
  "بيروت",
  "صيدا",
  "بعلبك-الهرمل",
  "النبطية",
  "حبل لبنان",
  "كسروان-جبيل",
  "لبنان الجنوبي",
  "لبنان الشمالي",
  "عكار",
];

const NAMES = [
  "Ahmad Khalil",
  "Sara Hassan",
  "Rami Nassif",
  "Lara Khoury",
  "Omar Fares",
  "Dina Saad",
  "Karim Aziz",
  "Maya Haddad",
  "Jad Mansour",
  "Nour Saleh",
];

// ─────────────────────────────────────────
//  Load Test Stages
//  هدفنا: 50 أوردر خلال 5 دقايق
//  كل VU بيعمل ~1 أوردر كل 5-6 ثواني
//  10 VUs × 30 iters = ~300 فرصة → نختار 50 منها
// ─────────────────────────────────────────
export const options = {
  scenarios: {
    order_simulation: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10 }, // warm-up
        { duration: "3m", target: 10 }, // sustained load
        { duration: "30s", target: 0 }, // ramp-down
      ],
    },
  },
  thresholds: {
    // الـ checkout يجب يكمل تحت 3 ثواني 95% من الوقت
    checkout_duration_ms: ["p(95)<3000"],
    homepage_duration_ms: ["p(95)<1500"],
    product_page_duration_ms: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
    orders_success_rate: ["rate>0.90"],
  },
};

// ─────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const prefix = ["03", "70", "71", "76", "78", "79", "81"];
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${randomFrom(prefix)}${num}`;
}

function buildOrderPayload(storeId) {
  const product = randomFrom(FAKE_PRODUCTS);
  const qty = Math.floor(1 + Math.random() * 3);

  return {
    storeId,
    customerName: randomFrom(NAMES),
    customerEmail: `test${Math.floor(Math.random() * 9999)}@loadtest.dev`,
    customerPhone: randomPhone(),
    city: randomFrom(CITIES),
    address: `شارع ${Math.floor(Math.random() * 100)}، بناية ${Math.floor(Math.random() * 50)}`,
    notes: Math.random() > 0.6 ? "اتصلوا قبل التوصيل" : "",
    shipping: Math.random() > 0.5 ? 5000 : 0,
    couponCode: "",
    paymentMethod: randomFrom(PAYMENT_METHODS),
    isGift: false,
    items: [
      {
        productId: product.productId,
        qty,
        variantSelections: {},
      },
    ],
  };
}

// ─────────────────────────────────────────
//  Main VU Function
// ─────────────────────────────────────────
export default function () {
  // ── 1. تصفح الصفحة الرئيسية ──────────────
  group("01_homepage", () => {
    const start = Date.now();
    const res = http.get(BASE_URL, {
      tags: { page: "homepage" },
    });
    homepageDuration.add(Date.now() - start);

    check(res, {
      "homepage: status 200": (r) => r.status === 200,
      "homepage: is HTML": (r) =>
        (r.headers["Content-Type"] || "").includes("text/html"),
    });

    if (res.status !== 200) {
      console.error(`❌ Homepage failed | status=${res.status} | VU=${__VU}`);
    }
  });

  sleep(1 + Math.random() * 2); // المستخدم بيتصفح 1-3 ثواني

  // ── 2. فتح صفحة منتج ────────────────────
  const chosenProduct = randomFrom(FAKE_PRODUCTS);
  group("02_product_page", () => {
    const start = Date.now();
    // Next.js storefront — الـ URL عادةً /products/[slug] أو /p/[id]
    // بدّل الـ path حسب هيكل موقعك
    const url = `${BASE_URL}/products`;
    const res = http.get(url, {
      tags: { page: "products_list" },
    });
    productDuration.add(Date.now() - start);

    check(res, {
      "products: status 200 or 404": (r) => [200, 404].includes(r.status),
    });
  });

  sleep(2 + Math.random() * 3); // المستخدم بيقرأ تفاصيل المنتج

  // ── 3. إرسال الـ checkout (الأوردر الحقيقي) ──
  group("03_checkout", () => {
    // storeId: بتحتاج تحطه صح — اجلبه من URL الـ API أو الـ dashboard
    // مؤقتاً بنحاول نجيبه من الـ homepage أو نحطه hardcoded
    const storeId = STORE_ID || "00000000-0000-0000-0000-000000000000";

    const payload = buildOrderPayload(storeId);
    const body = JSON.stringify(payload);

    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/checkout`, body, {
      headers: { "Content-Type": "application/json" },
      tags: { page: "checkout" },
      timeout: "10s",
    });
    const duration = Date.now() - start;
    checkoutDuration.add(duration);

    const success = check(res, {
      "checkout: status 201": (r) => r.status === 201,
      "checkout: success=true": (r) => {
        try {
          return JSON.parse(r.body).success === true;
        } catch {
          return false;
        }
      },
      "checkout: has orderId": (r) => {
        try {
          return !!JSON.parse(r.body).orderId;
        } catch {
          return false;
        }
      },
    });

    if (success) {
      ordersSubmitted.add(1);
      ordersSuccessRate.add(1);
      try {
        const data = JSON.parse(res.body);
        console.log(
          `✅ ORDER CREATED | orderId=${data.orderId} | ` +
            `VU=${__VU} | iter=${__ITER} | duration=${duration}ms | ` +
            `product=${chosenProduct.name}`,
        );
      } catch {}
    } else {
      ordersFailed.add(1);
      ordersSuccessRate.add(0);
      console.error(
        `❌ CHECKOUT FAILED | status=${res.status} | ` +
          `VU=${__VU} | iter=${__ITER} | duration=${duration}ms | ` +
          `body=${res.body?.substring(0, 200)}`,
      );
    }
  });

  sleep(1 + Math.random() * 2); // تأخير طبيعي قبل الـ iteration التالي
}

// ─────────────────────────────────────────
//  Summary Report
// ─────────────────────────────────────────
export function handleSummary(data) {
  const metrics = data.metrics;
  const orders = metrics["orders_submitted"]?.values?.count || 0;
  const failed = metrics["orders_failed"]?.values?.count || 0;
  const p95Check = metrics["checkout_duration_ms"]?.values?.["p(95)"] || 0;
  const p95Home = metrics["homepage_duration_ms"]?.values?.["p(95)"] || 0;

  const report = `
╔══════════════════════════════════════════════════════════╗
║            🛍️  Mahally Load Test — Final Report          ║
╠══════════════════════════════════════════════════════════╣
║  🏪 Store : almanhalbooksshop.mahally.app                ║
║  ⏱️  Duration : ~5 minutes                               ║
╠══════════════════════════════════════════════════════════╣
║  📦 Orders Created (success) : ${String(orders).padEnd(26)}║
║  ❌ Orders Failed             : ${String(failed).padEnd(26)}║
║  📊 Success Rate              : ${String(
    metrics["orders_success_rate"]?.values?.rate
      ? (metrics["orders_success_rate"].values.rate * 100).toFixed(1) + "%"
      : "N/A",
  ).padEnd(26)}║
╠══════════════════════════════════════════════════════════╣
║  ⚡ Checkout p(95)  : ${String(p95Check.toFixed(0) + "ms").padEnd(35)}║
║  ⚡ Homepage p(95)  : ${String(p95Home.toFixed(0) + "ms").padEnd(35)}║
╠══════════════════════════════════════════════════════════╣
║  ${orders >= 50 ? "✅ TARGET MET: 50+ orders submitted!" : "⚠️  Target not reached — check storeId / productIds"}${" ".repeat(orders >= 50 ? 12 : 2)}║
╚══════════════════════════════════════════════════════════╝
`;

  console.log(report);

  return {
    stdout: report,
    "mahally-load-test-result.json": JSON.stringify(data, null, 2),
  };
}
