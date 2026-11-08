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
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const u = await fetchPublicBusinessUnits()
      setUnits(u)
      const uid = selectedUnit ? parseInt(selectedUnit, 10) : undefined
      const p = await fetchPublicProducts({ unit_usaha_id: uid, search })
      setProducts(p)
    } catch { /* ignored */ }
    finally { setLoading(false) }
  }, [selectedUnit, search])

  useEffect(() => { loadData() }, [loadData])
  return { units, products, selectedUnit, setSelectedUnit, search, setSearch, loading }
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
  search, setSearch, selectedUnit, setSelectedUnit, units,
}: {
  search: string; setSearch: (s: string) => void; selectedUnit: string; setSelectedUnit: (u: string) => void; units: BusinessUnitSummary[]
}) {
  const unitOpts = [{ value: '', label: 'Semua Unit Usaha' }, ...units.map((u) => ({ value: String(u.id), label: u.name }))]
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="w-full sm:w-72">
        <Input placeholder="Cari nama produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="w-full sm:w-64">
        <Select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} options={unitOpts} />
      </div>
    </div>
  )
}

function ProductCard({ p, onAdd }: { p: ProductSummary; onAdd: (p: ProductSummary) => void }) {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-brand-500/40 transition-all">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] text-dark-400">
          <span className="flex items-center gap-1"><Building2 size={12} /> Unit #{p.unit_usaha_id}</span>
          <span className="bg-white/5 px-2 py-0.5 rounded border border-glass-border">{p.category || 'Komoditas'}</span>
        </div>
        <h3 className="font-semibold text-sm text-dark-100 leading-snug">{p.name}</h3>
      </div>
      <div className="pt-2 border-t border-glass-border/40 flex items-center justify-between">
        <div>
          <p className="text-xs text-dark-400">Harga Satuan</p>
          <p className="font-mono font-bold text-brand-400 text-sm">{formatRupiah(p.price)}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => onAdd(p)} disabled={p.stock <= 0}>
          <ShoppingCart size={14} /> {p.stock > 0 ? 'Beli' : 'Habis'}
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
  const { units, products, selectedUnit, setSelectedUnit, search, setSearch, loading } = useCatalogData()
  const { handleAdd, handleServiceSubmit } = useCatalogActions(addItem)
  const [serviceModal, setServiceModal] = useState(false)

  return (
    <div className="space-y-6">
      <CatalogHero onOpenServiceModal={() => setServiceModal(true)} />
      <CatalogFilterBar search={search} setSearch={setSearch} selectedUnit={selectedUnit} setSelectedUnit={setSelectedUnit} units={units} />
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
