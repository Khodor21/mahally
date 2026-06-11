/**
 * @/types/api.ts - Centralized Type Definitions
 *
 * All API-related types should be defined here, not scattered across components.
 * Import from here in api.ts, hooks, and panels.
 */

// ============================================
// PRODUCTS
// ============================================
export interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  created_at: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  stock: string;
  images: string[];
  category_id: string;
}

// ============================================
// ORDERS
// ============================================
export interface OrderItem {
  id: string;
  qty: number;
  title?: string;
  price?: number;
  image?: string;
  total?: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  city?: string;
  address?: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  order_items: OrderItem[];
}

// ============================================
// CUSTOMERS
// ============================================
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  governorate: string;
  created_at: string;
}

// ============================================
// COUPONS
// ============================================
export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  description?: string;
  min_purchase: number;
  max_uses: number;
  max_uses_per_customer: number;
  expiry_date: string;
  is_active: boolean;
  used_count: number;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

// ============================================
// CATEGORIES
// ============================================
export interface Category {
  id: string;
  store_id?: string;
  title: string;
  logo_url?: string;
  product_count: number;
  created_at: string;
}

// ============================================
// STORE
// ============================================
export interface StoreData {
  id: string;
  admin_name: string;
  admin_email: string;
  store_name: string;
  slug: string;
  location: string | null;
  phone: string | null;
  store_type: string | null;
  created_at: string;
  is_active: boolean;
  primary_color?: string;
  privacy_policy?: string;
  shipping_policy?: string;
  return_policy?: string;
  logo_url?: string;
}

// ============================================
// HERO BANNERS
// ============================================
export interface HeroBanner {
  id: string;
  store_id?: string;
  image: string;
  active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// GENERAL TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type Lang = "ar" | "en";

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

export interface CategoryFormData {
  title: string;
  logo_url?: string;
}

export interface HeroBannerFormData {
  image: string;
  active?: boolean;
  order?: number;
}

export type NavItem =
  | "home"
  | "orders"
  | "products"
  | "customers"
  | "analytics"
  | "settings"
  | "categories"
  | "ai"
  | "storefront"
  | "coupons"
  | "occasions"
  | "partnerships";

export type Language = "ar" | "en";
