export const STORE_TYPES = [
  { value: "fashion", label: "ملابس وأزياء", unified: "1f457" },
  { value: "electronics", label: "إلكترونيات", unified: "1f4f1" },
  { value: "food", label: "مأكولات ومشروبات", unified: "1f354" },
  { value: "beauty", label: "تجميل وعناية", unified: "1f484" },
  { value: "home", label: "منزل وأثاث", unified: "1f3e0" },
  { value: "sports", label: "رياضة وهوايات", unified: "26bd" },
  { value: "books", label: "كتب وتعليم", unified: "1f4da" },
  { value: "jewelry", label: "مجوهرات وإكسسوارات", unified: "1f48d" },
  { value: "toys", label: "ألعاب أطفال", unified: "1f9f8" },
  { value: "other", label: "متجر متنوع", unified: "1f3ea" },
];

export const PAYMENT_METHODS = [
  {
    value: "cash_on_delivery",
    label: "الدفع عند الاستلام",
    description: "الزبون يدفع عند استلام الطلب",
    icon: "1f682",
    default: true,
  },
  {
    value: "whish_money",
    label: "محفظة وش",
    description: "تحويل أموال عبر تطبيق وش",
    icon: "1f4b3",
    default: false,
  },
  {
    value: "bob_finance",
    label: "OMT ",
    description: "الدفع عبر خدمة بوب فاينينس - OMT -",
    icon: "1f4b5",
    default: false,
  },
];

export const STEPS = [
  { id: 1, label: "البريد" },
  { id: 2, label: "معلوماتك" },
  { id: 3, label: "عن المتجر" },
  { id: 4, label: "كلمة المرور" },
  { id: 5, label: "رابطك" },
];

export const INPUT_BASE =
  "w-full h-12 md:h-14 px-4 rounded border border-[#f3ede5] bg-gray-50 " +
  "text-brand-dark placeholder:text-[#bbb] text-sm outline-none " +
  "transition-all duration-200 focus:border-brand-dark focus:bg-white " +
  "focus:ring-4 focus:ring-brand-dark/5";

export const LABEL_BASE = "text-sm font-semibold text-brand-dark tracking-wide";
export const STORAGE_KEY = "mahalli_onboarding";

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

export type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  storeName: string;
  storeType: string;
  paymentMethods: string[];
  slug: string;
  password: string;
  confirmPassword: string;
};

export const DEFAULT_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  location: "",
  storeName: "",
  storeType: "",
  paymentMethods: ["cash_on_delivery"],
  slug: "",
  password: "",
  confirmPassword: "",
};

export function loadFromStorage(): { form: FormState; step: number } {
  if (typeof window === "undefined") return { form: DEFAULT_FORM, step: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { form: DEFAULT_FORM, step: 1 };
    const parsed = JSON.parse(raw);
    return {
      form: { ...DEFAULT_FORM, ...parsed.form },
      step: parsed.step ?? 1,
    };
  } catch {
    return { form: DEFAULT_FORM, step: 1 };
  }
}

export function saveToStorage(form: FormState, step: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
  } catch {}
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
