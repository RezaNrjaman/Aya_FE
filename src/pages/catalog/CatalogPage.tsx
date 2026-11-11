/** M5-001 / M5-003 / M5-004: Product & Service Catalog Page */
import { useState, useEffect, useCallback } from 'react'
import { Plus, ShoppingCart, Sparkles, Building2 } from 'lucide-react'
import { Button, Input, Select, useToast } from '@/components/ui'
import { fetchPublicBusinessUnits, fetchPublicProducts, createServiceRequest } from '@/features/m5/api'
import { useCart } from '@/features/m5/CartContext'
import type { BusinessUnitSummary, ProductSummary, CreateServiceRequestData } from '@/features/m5/types'
import { ServiceRequestModal } from './ServiceRequestModal'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useCatalogData() {
  const [units, setUnits] = useState<BusinessUnitSummary[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    fetchPublicProducts({})
      .then((all) => {
        if (!alive) return
        setCategories([...new Set(all.map((p) => p.category).filter(Boolean))].sort())
      })
      .catch(() => { if (alive) setCategories([]) })
    return () => { alive = false }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const u = await fetchPublicBusinessUnits()
      setUnits(u)
      const uid = selectedUnit ? parseInt(selectedUnit, 10) : undefined
      const p = await fetchPublicProducts({ unit_usaha_id: uid, category: selectedCategory || undefined, search })
      setProducts(p)
    } catch { /* ignored */ }
    finally { setLoading(false) }
  }, [selectedUnit, selectedCategory, search])

  useEffect(() => { loadData() }, [loadData])
  return { units, products, selectedUnit, setSelectedUnit, selectedCategory, setSelectedCategory, categories, search, setSearch, loading }
}

function CatalogHero({ onOpenServiceModal }: { onOpenServiceModal: () => void }) {
  return (
    <div className="glass-card p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1.5 max-w-xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
          <Sparkles size={12} /> Solusi Bisnis Terintegrasi
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-100">Katalog Produk & Solusi Usaha</h1>
        <p className="text-xs sm:text-sm text-dark-300">Temukan barang, komoditas, dan layanan dari seluruh unit bisnis terverifikasi Araya.</p>
      </div>
      <Button variant="primary" onClick={onOpenServiceModal}><Plus size={16} /> Ajukan Jasa Kustom</Button>
    </div>
  )
}

function CatalogFilterBar({
  search, setSearch, selectedUnit, setSelectedUnit, selectedCategory, setSelectedCategory, categories, units,
}: {
  search: string
  setSearch: (s: string) => void
  selectedUnit: string
  setSelectedUnit: (u: string) => void
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  categories: string[]
  units: BusinessUnitSummary[]
}) {
  const unitOpts = [{ value: '', label: 'Semua Unit Usaha' }, ...units.map((u) => ({ value: String(u.id), label: u.name }))]
  const categoryOpts = [{ value: '', label: 'Semua Kategori' }, ...categories.map((c) => ({ value: c, label: c }))]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Input placeholder="Cari nama produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <Select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} options={unitOpts} />
      <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} options={categoryOpts} />
    </div>
  )
}

function ProductCard({ p, onAdd }: { p: ProductSummary; onAdd: (p: ProductSummary) => void }) {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-brand-500/40 transition-all">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] text-dark-400">
          <span className="flex items-center gap-1"><Building2 size={12} /> Unit #{p.unit_usaha_id}</span>
          <span className="bg-white/5 px-2 py-0.5 rounded border border-glass-border">{p.product_type === 'jasa' ? 'Jasa' : 'Barang'} · {p.category || 'Umum'}</span>
        </div>
        <h3 className="font-semibold text-sm text-dark-100 leading-snug">{p.name}</h3>
      </div>
      <div className="pt-2 border-t border-glass-border/40 flex items-center justify-between">
        <div>
          <p className="text-xs text-dark-400">Harga Satuan</p>
          <p className="font-mono font-bold text-brand-400 text-sm">{formatRupiah(p.price)}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => onAdd(p)} disabled={p.product_type !== 'jasa' && p.stock <= 0}>
          <ShoppingCart size={14} /> {p.product_type === 'jasa' || p.stock > 0 ? 'Beli' : 'Habis'}
        </Button>
      </div>
    </div>
  )
}

function useCatalogActions(addItem: (id: number, q: number) => Promise<void>) {
  const { toast } = useToast()
  const handleAdd = async (p: ProductSummary) => {
    try { await addItem(p.id, 1); toast('success', `${p.name} berhasil ditambahkan ke keranjang`) }
    catch { toast('error', 'Gagal menambahkan ke keranjang') }
  }
  const handleServiceSubmit = async (d: CreateServiceRequestData) => {
    await createServiceRequest(d); toast('success', 'Permintaan layanan berhasil diajukan!')
  }
  return { handleAdd, handleServiceSubmit }
}

export function CatalogPage() {
  const { addItem } = useCart()
  const {
    units, products, selectedUnit, setSelectedUnit, selectedCategory, setSelectedCategory,
    categories, search, setSearch, loading,
  } = useCatalogData()
  const { handleAdd, handleServiceSubmit } = useCatalogActions(addItem)
  const [serviceModal, setServiceModal] = useState(false)

  return (
    <div className="space-y-6">
      <CatalogHero onOpenServiceModal={() => setServiceModal(true)} />
      <CatalogFilterBar
        search={search} setSearch={setSearch}
        selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        categories={categories} units={units}
      />
      {loading ? (
        <p className="text-center py-12 text-xs text-dark-400">Memuat katalog produk...</p>
      ) : products.length === 0 ? (
        <div className="glass-card text-center py-12 text-dark-400 text-sm rounded-xl">Tidak ada produk ditemukan sesuai filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => <ProductCard key={p.id} p={p} onAdd={handleAdd} />)}
        </div>
      )}
      <ServiceRequestModal open={serviceModal} units={units} onClose={() => setServiceModal(false)} onSubmit={handleServiceSubmit} />
    </div>
  )
}
