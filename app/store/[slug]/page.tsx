import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { MapPin, Phone, Tag, Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const STORE_TYPE_LABELS: Record<string, string> = {
  fashion: '👗 Fashion & Clothing',
  electronics: '📱 Electronics',
  food: '🍔 Food & Beverages',
  beauty: '💄 Beauty & Cosmetics',
  home: '🏠 Home & Furniture',
  sports: '⚽ Sports & Outdoors',
  books: '📚 Books & Education',
  jewelry: '💍 Jewelry & Accessories',
  toys: '🧸 Toys & Games',
  other: '🏪 Other',
}

// This page renders the public-facing store for a given slug
// Route: /store/[slug]  (also used for subdomain routing via middleware)
export default async function StorePage({ params }: { params: { slug: string } }) {
  const { data: store, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !store) notFound()

  return (
    <div className="min-h-screen bg-ink">
      {/* Store header banner */}
      <div className="relative overflow-hidden">
        {/* Background gradient based on store type */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-ink to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative px-6 md:px-12 py-16 max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-paper text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Powered by StoreForge
          </Link>

          <div className="flex items-start gap-6">
            {/* Store avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-3xl md:text-4xl flex-shrink-0">
              {store.store_type === 'fashion' ? '👗' :
               store.store_type === 'electronics' ? '📱' :
               store.store_type === 'food' ? '🍔' :
               store.store_type === 'beauty' ? '💄' :
               store.store_type === 'home' ? '🏠' :
               store.store_type === 'sports' ? '⚽' :
               store.store_type === 'books' ? '📚' :
               store.store_type === 'jewelry' ? '💍' :
               store.store_type === 'toys' ? '🧸' : '🏪'}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
                <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Open</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">{store.store_name}</h1>
              <p className="text-muted text-lg">{STORE_TYPE_LABELS[store.store_type] || store.store_type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store info */}
      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: MapPin, label: 'Location', value: store.location },
            { icon: Phone, label: 'Contact', value: store.phone },
            { icon: Tag, label: 'Category', value: STORE_TYPE_LABELS[store.store_type] },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Products section — placeholder */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Products</h2>
            <span className="text-xs font-mono text-muted px-3 py-1 rounded-full border border-white/10">
              0 items
            </span>
          </div>

          {/* Empty state */}
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <Store className="w-12 h-12 text-muted/50 mx-auto mb-4" />
            <p className="text-muted mb-1">No products yet</p>
            <p className="text-xs text-muted/60">
              The store owner hasn&apos;t added any products yet.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center">
        <p className="text-xs text-muted font-mono">
          {store.store_name} · Powered by{' '}
          <Link href="/" className="text-accent hover:underline">StoreForge</Link>
        </p>
      </footer>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: store } = await supabaseAdmin
    .from('stores')
    .select('store_name, store_type, location')
    .eq('slug', params.slug)
    .single()

  if (!store) return { title: 'Store Not Found' }

  return {
    title: `${store.store_name} — Online Store`,
    description: `Shop at ${store.store_name}, a ${store.store_type} store in ${store.location}`,
  }
}
