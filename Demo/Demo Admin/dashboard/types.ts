export type Language = 'ar' | 'en'

export type NavItem =
  | 'home'
  | 'orders'
  | 'products'
  | 'customers'
  | 'analytics'
  | 'settings'
  | 'coupons'
  | 'partnerships'
  | 'occasions'

export interface StoreData {
  id: string
  admin_name: string
  admin_email: string
  store_name: string
  slug: string
  location: string
  phone: string
  store_type: string
  created_at: string
  is_active: boolean
}

export interface Order {
  id: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  date: string
  items: number
}

export interface Product {
  id: string
  name: string
  nameEn: string
  price: number
  stock: number
  category: string
  sales: number
  image: string
}

export interface Customer {
  id: string
  name: string
  email: string
  orders: number
  totalSpent: number
  joinDate: string
  status: 'active' | 'inactive'
}

export interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  uses: number
  maxUses: number
  expiry: string
  active: boolean
}

export interface Stat {
  label: string
  labelEn: string
  value: string
  change: number
  icon: string
}
