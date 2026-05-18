// 'use client'

// import { useEffect, useState } from 'react'
// import { useSession, signOut } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import {
//   Store, MapPin, Phone, Tag, Link2, LogOut, Copy,
//   CheckCircle, ExternalLink, LayoutDashboard, Settings,
//   TrendingUp, Users, ShoppingBag, Globe, Loader2
// } from 'lucide-react'

// interface StoreData {
//   id: string
//   admin_name: string
//   admin_email: string
//   store_name: string
//   slug: string
//   location: string
//   phone: string
//   store_type: string
//   created_at: string
//   is_active: boolean
// }

// const STORE_TYPE_LABELS: Record<string, string> = {
//   fashion: '👗 Fashion & Clothing',
//   electronics: '📱 Electronics',
//   food: '🍔 Food & Beverages',
//   beauty: '💄 Beauty & Cosmetics',
//   home: '🏠 Home & Furniture',
//   sports: '⚽ Sports & Outdoors',
//   books: '📚 Books & Education',
//   jewelry: '💍 Jewelry & Accessories',
//   toys: '🧸 Toys & Games',
//   other: '🏪 Other',
// }

// export default function DashboardPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [store, setStore] = useState<StoreData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [copied, setCopied] = useState(false)

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login')
//     }
//   }, [status, router])

//   useEffect(() => {
//     if (status === 'authenticated') {
//       fetch('/api/stores')
//         .then(r => r.json())
//         .then(d => {
//           setStore(d.store)
//           setLoading(false)
//         })
//         .catch(() => setLoading(false))
//     }
//   }, [status])

//   const storeUrl = store
//     ? `${store.slug}.${process.env.NEXT_PUBLIC_APP_DOMAIN || 'yoursaas.com'}`
//     : ''

//   const copyLink = () => {
//     navigator.clipboard.writeText(storeUrl)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   if (status === 'loading' || loading) {
//     return (
//       <div className="min-h-screen bg-ink flex items-center justify-center">
//         <Loader2 className="w-6 h-6 text-accent animate-spin" />
//       </div>
//     )
//   }

//   if (!store) {
//     return (
//       <div className="min-h-screen bg-ink flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-muted mb-4">Could not load store data.</p>
//           <Link href="/onboarding" className="text-accent hover:underline">
//             Create a store
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   const createdDate = new Date(store.created_at).toLocaleDateString('en-US', {
//     year: 'numeric', month: 'long', day: 'numeric'
//   })

//   return (
//     <div className="min-h-screen bg-ink">
//       {/* Sidebar */}
//       <div className="fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-surface/50 flex flex-col hidden md:flex">
//         <div className="px-6 py-6 border-b border-white/5">
//           <Link href="/" className="font-display text-lg font-bold">
//             Store<span className="text-accent">Forge</span>
//           </Link>
//         </div>

//         <nav className="flex-1 px-4 py-6 space-y-1">
//           {[
//             { icon: LayoutDashboard, label: 'Dashboard', active: true },
//             { icon: ShoppingBag, label: 'Products', active: false },
//             { icon: Users, label: 'Customers', active: false },
//             { icon: TrendingUp, label: 'Analytics', active: false },
//             { icon: Globe, label: 'Store Page', active: false, href: `/${store.slug}` },
//             { icon: Settings, label: 'Settings', active: false },
//           ].map((item) => (
//             <button
//               key={item.label}
//               className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
//                 item.active
//                   ? 'bg-accent/10 text-accent border border-accent/20'
//                   : 'text-muted hover:text-paper hover:bg-white/5'
//               }`}
//             >
//               <item.icon className="w-4 h-4" />
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         <div className="px-4 py-4 border-t border-white/5">
//           <div className="flex items-center gap-3 px-3 py-2 mb-2">
//             <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
//               {store.admin_name[0].toUpperCase()}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium truncate">{store.admin_name}</p>
//               <p className="text-xs text-muted truncate">{store.admin_email}</p>
//             </div>
//           </div>
//           <button
//             onClick={() => signOut({ callbackUrl: '/login' })}
//             className="w-full flex items-center gap-2 px-3 py-2 text-muted hover:text-paper text-sm rounded-lg hover:bg-white/5 transition-all"
//           >
//             <LogOut className="w-4 h-4" />
//             Sign out
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="md:ml-64 p-6 md:p-10">
//         {/* Top bar (mobile) */}
//         <div className="flex items-center justify-between mb-8 md:hidden">
//           <span className="font-display text-lg font-bold">
//             Store<span className="text-accent">Forge</span>
//           </span>
//           <button
//             onClick={() => signOut({ callbackUrl: '/login' })}
//             className="text-muted hover:text-paper"
//           >
//             <LogOut className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Header */}
//         <div className="mb-10 opacity-0 animate-fade-up">
//           <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
//             Welcome back, {store.admin_name.split(' ')[0]} 👋
//           </h1>
//           <p className="text-muted">Here's an overview of your store.</p>
//         </div>

//         {/* Store link card */}
//         <div className="mb-8 p-6 rounded-2xl border border-accent/20 bg-accent/5 opacity-0 animate-fade-up delay-100">
//           <div className="flex items-start justify-between gap-4 flex-wrap">
//             <div>
//               <p className="text-xs font-mono text-accent/70 uppercase tracking-wider mb-1">
//                 Your Live Store Link
//               </p>
//               <p className="font-mono text-xl md:text-2xl text-accent font-medium">
//                 {storeUrl}
//               </p>
//               <p className="text-xs text-muted mt-1">
//                 Share this with your customers
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={copyLink}
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-all text-sm font-mono"
//               >
//                 {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
//                 {copied ? 'Copied!' : 'Copy'}
//               </button>
//               <a
//                 href={`https://${storeUrl}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-paper hover:bg-accent/90 transition-all text-sm font-semibold"
//               >
//                 Visit <ExternalLink className="w-4 h-4" />
//               </a>
//             </div>
//           </div>
//         </div>

//         {/* Stats row */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 opacity-0 animate-fade-up delay-200">
//           {[
//             { label: 'Total Visits', value: '—', icon: TrendingUp, note: 'Coming soon' },
//             { label: 'Products', value: '0', icon: ShoppingBag, note: 'Add products' },
//             { label: 'Customers', value: '0', icon: Users, note: 'No orders yet' },
//             { label: 'Status', value: 'Live', icon: Globe, note: 'Store is active', accent: true },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               className={`p-5 rounded-xl border transition-all ${
//                 stat.accent
//                   ? 'border-green-500/20 bg-green-500/5'
//                   : 'border-white/5 bg-white/[0.02] hover:border-white/10'
//               }`}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <p className="text-xs text-muted font-mono uppercase tracking-wider">{stat.label}</p>
//                 <stat.icon className={`w-4 h-4 ${stat.accent ? 'text-green-400' : 'text-muted'}`} />
//               </div>
//               <p className={`text-2xl font-display font-bold ${stat.accent ? 'text-green-400' : 'text-paper'}`}>
//                 {stat.value}
//               </p>
//               <p className="text-xs text-muted mt-1">{stat.note}</p>
//             </div>
//           ))}
//         </div>

//         {/* Store details */}
//         <div className="grid md:grid-cols-2 gap-6 opacity-0 animate-fade-up delay-300">
//           {/* Store Info */}
//           <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
//             <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
//               <Store className="w-5 h-5 text-accent" />
//               Store Information
//             </h3>
//             <div className="space-y-4">
//               {[
//                 { icon: Store, label: 'Store Name', value: store.store_name },
//                 { icon: Tag, label: 'Category', value: STORE_TYPE_LABELS[store.store_type] || store.store_type },
//                 { icon: MapPin, label: 'Location', value: store.location },
//                 { icon: Phone, label: 'Phone', value: store.phone },
//                 { icon: Link2, label: 'Handle', value: `@${store.slug}` },
//               ].map((item) => (
//                 <div key={item.label} className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
//                     <item.icon className="w-4 h-4 text-muted" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-muted">{item.label}</p>
//                     <p className="text-sm text-paper font-medium">{item.value}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Account Info */}
//           <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
//             <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
//               <Users className="w-5 h-5 text-accent" />
//               Account Details
//             </h3>
//             <div className="space-y-4">
//               {[
//                 { label: 'Admin Name', value: store.admin_name },
//                 { label: 'Email', value: store.admin_email },
//                 { label: 'Member Since', value: createdDate },
//                 { label: 'Store ID', value: `#${store.id.slice(0, 8).toUpperCase()}` },
//               ].map((item) => (
//                 <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
//                   <span className="text-xs text-muted">{item.label}</span>
//                   <span className="text-sm font-mono text-paper/90">{item.value}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10">
//               <p className="text-xs text-muted mb-1">Custom domain</p>
//               <p className="text-sm text-paper/80">
//                 Want <span className="text-accent font-mono">yourstore.com</span>?{' '}
//                 Custom domains coming soon.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import React from 'react'
import Dashboard from "./Dashboard"
const page = () => {
  return (
    <div className="w-full"><Dashboard /></div>
  )
}

export default page