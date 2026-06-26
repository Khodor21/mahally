/**
 * @/lib/api.ts - Centralized API Layer
 *
 * Single source of truth for all API calls across the dashboard.
 * All panels should import from here, not call fetch() directly.
 */

import {
  Product,
  ProductFormData,
  Order,
  Customer,
  Coupon,
  Category,
  StoreData,
  HeroBanner,
  Testimonial,
  TestimonialFormData,
} from "@/types/api";

// ============================================
// BASE RESPONSE TYPE
// ============================================
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ============================================
// ERROR HANDLING HELPER
// ============================================
async function handleApiResponse<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || `API Error: ${res.status}`);
  }

  if (!json.data) {
    throw new Error("No data in response");
  }

  return json.data;
}

// ============================================
// PRODUCTS
// ============================================
export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data || [];
}

export async function createProduct(form: ProductFormData): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      images: form.images,
      category_id: form.category_id,
      variants: form.variants,
    }),
  });

  return handleApiResponse(res);
}

export async function updateProduct(
  id: string,
  form: ProductFormData,
): Promise<Product> {
  // Parse discount_price: empty string or null → null, otherwise parse as float
  let parsedDiscountPrice: number | null = null;
  if (
    form.discount_price !== "" &&
    form.discount_price !== null &&
    form.discount_price !== undefined
  ) {
    parsedDiscountPrice = parseFloat(form.discount_price);
    if (isNaN(parsedDiscountPrice)) {
      parsedDiscountPrice = null;
    }
  }

  const res = await fetch("/api/products", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      discount_price: parsedDiscountPrice,
      stock: parseInt(form.stock) || 0,
      images: form.images,
      category_id: form.category_id,
      variants: form.variants,
      pin: form.pin ?? false,
    }),
  });

  return handleApiResponse(res);
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
}

// ============================================
// ORDERS
// ============================================
export async function getOrders(storeId: string): Promise<Order[]> {
  const res = await fetch(`/api/checkout?storeId=${storeId}`, {
    cache: "no-store",
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch orders");
  }

  return data.data || [];
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<Order> {
  const res = await fetch("/api/checkout", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  });

  return handleApiResponse(res);
}

// ============================================
// CUSTOMERS
// ============================================
export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/store-customers", {
    cache: "no-store",
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch customers");
  }

  return data.data || [];
}

// ============================================
// COUPONS
// ============================================
export async function getCoupons(): Promise<Coupon[]> {
  const res = await fetch("/api/coupons", { cache: "no-store" });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to load coupons");
  }

  return data.data || [];
}

export interface CouponFormData {
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  description?: string;
  minPurchase: number;
  maxUses: number;
  maxUsesPerCustomer: number;
  expiryDate: string;
  isActive: boolean;
}

export async function createCoupon(form: CouponFormData): Promise<Coupon> {
  const res = await fetch("/api/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: form.code,
      type: form.type,
      discount: parseFloat(form.discount.toString()),
      description: form.description,
      min_purchase: parseFloat(form.minPurchase.toString()),
      max_uses: parseInt(form.maxUses.toString()),
      max_uses_per_customer: parseInt(form.maxUsesPerCustomer.toString()),
      expiry_date: new Date(form.expiryDate).toISOString(),
      is_active: form.isActive,
    }),
  });

  return handleApiResponse(res);
}

export async function updateCoupon(
  couponId: string,
  form: CouponFormData,
): Promise<Coupon> {
  const res = await fetch("/api/coupons", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      couponId,
      code: form.code,
      type: form.type,
      discount: parseFloat(form.discount.toString()),
      description: form.description,
      min_purchase: parseFloat(form.minPurchase.toString()),
      max_uses: parseInt(form.maxUses.toString()),
      max_uses_per_customer: parseInt(form.maxUsesPerCustomer.toString()),
      expiry_date: new Date(form.expiryDate).toISOString(),
      is_active: form.isActive,
    }),
  });

  return handleApiResponse(res);
}

export async function deleteCoupon(couponId: string): Promise<void> {
  const res = await fetch("/api/coupons", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ couponId }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to delete coupon");
}

export async function toggleCouponStatus(
  couponId: string,
  isActive: boolean,
): Promise<Coupon> {
  const res = await fetch("/api/coupons", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ couponId, is_active: isActive }),
  });

  return handleApiResponse(res);
}

// ============================================
// CATEGORIES
// ============================================
export async function getCategories(storeId: string): Promise<Category[]> {
  const res = await fetch(`/api/categories?store_id=${storeId}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch categories");

  return res.json();
}

export interface CategoryFormData {
  title: string;
  logo_url?: string;
}

export async function createCategory(
  storeId: string,
  data: CategoryFormData,
): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.title,
      logo_url: data.logo_url,
      store_id: storeId,
    }),
  });

  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(
  categoryId: string,
  data: CategoryFormData,
): Promise<Category> {
  const res = await fetch(`/api/categories/${categoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(
  categoryId: string,
  storeId: string,
): Promise<void> {
  const res = await fetch(`/api/categories/${categoryId}?store_id=${storeId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete category");
}

// ============================================
// STORE / SETTINGS
// ============================================
export async function getStore(): Promise<StoreData> {
  const res = await fetch("/api/stores", { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || !data.store) {
    throw new Error(data.message || "Failed to fetch store");
  }

  return data.store;
}

export async function updateStore(
  updates: Partial<StoreData>,
): Promise<StoreData> {
  const res = await fetch("/api/stores", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok || !data.store) {
    throw new Error(data.message || "Failed to update store");
  }

  return data.store;
}

// ============================================
// HERO BANNERS
// ============================================
export interface HeroBannerFormData {
  image: string;
  active?: boolean;
  order?: number;
}

export async function getHeroBanners(storeId: string): Promise<HeroBanner[]> {
  const res = await fetch(`/api/hero?storeId=${storeId}&admin=true`, {
    cache: "no-store",
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch banners");
  }

  return data.data || [];
}

export async function createHeroBanner(
  storeId: string,
  form: HeroBannerFormData,
): Promise<HeroBanner> {
  const res = await fetch("/api/hero", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_id: storeId,
      image: form.image,
      active: form.active !== false,
      order: form.order || 0,
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function updateHeroBanner(
  bannerId: string,
  form: Partial<HeroBannerFormData>,
): Promise<HeroBanner> {
  const res = await fetch(`/api/hero`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: bannerId,
      ...form,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update hero banner");
  }

  return data.data;
}
export async function deleteHeroBanner(bannerId: string): Promise<void> {
  const res = await fetch(`/api/hero/${bannerId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}

export async function toggleHeroBanner(id: string, active: boolean) {
  const res = await fetch("/api/hero", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      active,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to toggle hero banner");
  }

  return data.data;
}

export async function reorderHeroBanners(
  banners: Array<{ id: string; order: number }>,
): Promise<void> {
  const res = await fetch("/api/hero/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ banners }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}

// Testimonial

export async function getTestimonials(
  storeSlug?: string,
): Promise<Testimonial[]> {
  const params = new URLSearchParams();

  if (storeSlug) {
    params.append("store_slug", storeSlug);
    params.append("public", "true");
  } else {
    // ARCHITECTURE FIX: Force browser to bypass local fetch cache on Admin Dashboard
    params.append("_t", Date.now().toString());
  }

  const fetchOptions: RequestInit = storeSlug
    ? { next: { revalidate: 60 } } // Cache public queries for 60 seconds at Edge
    : { cache: "no-store" }; // Instruct Next.js server to skip cache

  const res = await fetch(
    `/api/testimonials?${params.toString()}`,
    fetchOptions,
  );
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch testimonials");
  }

  return data.data || [];
}

export async function createTestimonial(
  form: TestimonialFormData,
): Promise<Testimonial> {
  const res = await fetch("/api/testimonials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.name,
      role: form.role,
      content: form.content,
      rating: Math.floor(form.rating),
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function updateTestimonial(
  id: string,
  form: Partial<TestimonialFormData> & { is_active?: boolean },
): Promise<Testimonial> {
  const res = await fetch("/api/testimonials", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      ...form,
    }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`/api/testimonials?id=${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
}
