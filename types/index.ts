export type StoreType =
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'beauty'
  | 'home'
  | 'sports'
  | 'books'
  | 'jewelry'
  | 'toys'
  | 'other'

export interface Store {
  id: string
  admin_name: string
  admin_email: string
  store_name: string
  slug: string
  location: string
  phone: string
  store_type: StoreType
  created_at: string
  is_active: boolean
}

export interface OnboardingFormData {
  adminName: string
  adminEmail: string
  password: string
  storeName: string
  slug: string
  location: string
  phone: string
  storeType: StoreType
}
