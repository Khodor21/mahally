export interface Testimonial {
  id: number;
  name: string;
  role?: string | null;
  content: string;
  rating: number; // 1-5
  avatar?: string; // Optional image URL
}

export interface TestimonialFormData {
  name: string;
  role?: string | null;
  content: string;
  rating: number;
  avatar?: string;
}

export interface TestimonialsList {
  testimonials: Testimonial[];
}

// ============================================
// PRODUCTS
// ============================================
export interface VariantOption {
  id: string;
  name: string;
  price?: number;
  stock?: number;
}

export interface VariantGroup {
  id: string;
  title: string;
  options: VariantOption[];
}

export interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number | null;
  stock: number;
  images: string[];
  category_id?: string;
  variants?: VariantGroup[];
  pin: boolean;
  created_at: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  discount_price?: string;
  stock: string;
  images: string[];
  category_id: string;
  variants?: VariantGroup[];
  pin?: boolean;
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
  // Store table fields
  id: string;
  admin_name: string;
  admin_email: string;
  language: string;
  email?: string;
  store_name: string;
  slug: string;
  location: string | null;
  phone: string | null;
  store_type: string | null;
  created_at: string;
  delivery_cost?: number | null;
  is_active: boolean;

  // store_settings table fields - Branding
  primary_color?: string;
  promo_text?: string;
  logo_url?: string;
  description?: string;

  // store_settings table fields - Policies
  privacy_policy?: string;
  shipping_policy?: string;
  return_policy?: string;

  // store_settings table fields - Social Media
  whatsapp_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  snapchat_url?: string;

  // ✅ NEW: Testimonials
  testimonials?: TestimonialsList;
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

// Features
export interface Feature {
  id: number;
  store_id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureRequest {
  title: string;
  description: string;
  icon_name: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFeatureRequest {
  title?: string;
  description?: string;
  icon_name?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface FeatureResponse {
  success: boolean;
  data?: Feature | Feature[];
  error?: string;
}

// ============================================
// TESTIMONIALS
// ============================================

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
  image?: string;
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
