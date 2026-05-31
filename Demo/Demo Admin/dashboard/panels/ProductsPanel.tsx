"use client"
import { useState } from 'react'
import { Search, Plus, Edit2, Trash2 } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import { mockProducts } from '../data'

export default function ProductsPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const [search, setSearch] = useState('')

  const filtered = mockProducts.filter((p) => {
    const name = lang === 'ar' ? p.name : p.nameEn
    return name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search)
  })

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: tr.outOfStock, cls: 'bg-red-100 text-red-700' }
    if (stock <= 10) return { label: tr.lowStock, cls: 'bg-amber-100 text-amber-700' }
    return { label: tr.inStock, cls: 'bg-emerald-100 text-emerald-700' }
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up">
        {[
          { label: tr.totalProducts, value: mockProducts.length, color: 'bg-[rgb(60_28_84)] text-white' },
          { label: tr.inStock, value: mockProducts.filter(p => p.stock > 10).length, color: 'bg-emerald-50 text-emerald-700' },
          { label: tr.lowStock, value: mockProducts.filter(p => p.stock > 0 && p.stock <= 10).length, color: 'bg-amber-50 text-amber-700' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-70">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up delay-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-5 py-4 border-b border-[rgb(244_242_245)]">
          <div className="flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[rgb(60_28_84)]/40" />
            <input
              type="text"
              placeholder={tr.searchProducts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/40 outline-none w-full"
              dir={dir}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20">
            <Plus className="w-4 h-4" />
            {tr.addNewProduct}
          </button>
        </div>

        {/* Grid of products */}
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((product) => {
              const name = lang === 'ar' ? product.name : product.nameEn
              const stockStatus = getStockStatus(product.stock)
              return (
                <div
                  key={product.id}
                  className="border border-[rgb(244_242_245)] rounded-2xl p-4 hover:border-[rgb(207_195_223)] hover:shadow-md transition-all group"
                >
                  {/* Product image emoji + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[rgb(244_242_245)] flex items-center justify-center text-2xl flex-shrink-0">
                      {product.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[rgb(60_28_84)] text-sm leading-tight truncate">{name}</p>
                      <p className="text-xs text-[rgb(60_28_84)]/50 mt-0.5">{product.category}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${stockStatus.cls}`}>
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-[rgb(244_242_245)] rounded-xl">
                      <p className="text-xs text-[rgb(60_28_84)]/40">{tr.price}</p>
                      <p className="text-sm font-bold text-[rgb(60_28_84)]">{product.price}</p>
                    </div>
                    <div className="text-center p-2 bg-[rgb(244_242_245)] rounded-xl">
                      <p className="text-xs text-[rgb(60_28_84)]/40">{tr.stock}</p>
                      <p className="text-sm font-bold text-[rgb(60_28_84)]">{product.stock}</p>
                    </div>
                    <div className="text-center p-2 bg-[rgb(244_242_245)] rounded-xl">
                      <p className="text-xs text-[rgb(60_28_84)]/40">{tr.sales}</p>
                      <p className="text-sm font-bold text-[rgb(60_28_84)]">{product.sales}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgb(244_242_245)] text-[rgb(60_28_84)] text-xs font-semibold hover:bg-[rgb(207_195_223)] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                      {tr.edit}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      {tr.delete}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[rgb(60_28_84)]/40 text-sm">{tr.noData}</div>
          )}
        </div>
      </div>
    </div>
  )
}
