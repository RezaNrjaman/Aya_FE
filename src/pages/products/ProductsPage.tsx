import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Ban, CheckCircle } from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  DataTable,
  StatusBadge,
  Pagination,
  useToast,
} from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchAdminProducts, createProduct, updateProduct } from '@/features/m4/api'
import type { Product, CreateProductData } from '@/features/m4/types'
import { ProductFormModal } from './ProductFormModal'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useProducts() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminProducts({ page, per_page: 10, search })
      setProducts(res.data); setTotalPages(res.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat produk') }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { products, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function ProductActions({ p, onEdit, onToggle }: { p: Product; onEdit: (p: Product) => void; onToggle: (p: Product) => void }) {
  return (
    <div className="flex justify-end gap-1.5">
      <PermissionGate permission="m4.products.manage">
        <Button size="sm" variant="secondary" onClick={() => onEdit(p)} title="Edit"><Edit2 size={14} /></Button>
        <Button size="sm" variant={p.is_active ? 'danger' : 'secondary'} onClick={() => onToggle(p)} title={p.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
          {p.is_active ? <Ban size={14} /> : <CheckCircle size={14} className="text-success" />}
        </Button>
      </PermissionGate>
    </div>
  )
}

function getProductColumns(onEdit: (p: Product) => void, onToggle: (p: Product) => void) {
  return [
    {
      key: 'name', header: 'Produk / Jasa',
      render: (p: Product) => <div><p className="font-medium text-dark-100">{p.name}</p><p className="text-xs text-dark-400">{p.category || 'Umum'}</p></div>,
    },
    { key: 'price', header: 'Harga', render: (p: Product) => <span className="text-xs font-semibold text-dark-100">{formatRupiah(p.price)}</span> },
    { key: 'stock', header: 'Stok', render: (p: Product) => <span className="text-xs text-dark-300">{p.stock} unit</span> },
    { key: 'status', header: 'Status', render: (p: Product) => <StatusBadge label={p.is_active ? 'Aktif' : 'Nonaktif'} variant={p.is_active ? 'success' : 'neutral'} /> },
    { key: 'actions', header: 'Aksi', className: 'text-right', render: (p: Product) => <ProductActions p={p} onEdit={onEdit} onToggle={onToggle} /> },
  ]
}

function useProductActions(reload: () => void) {
  const { toast } = useToast()
  const handleSave = async (editId: number | null, d: CreateProductData) => {
    if (editId) { await updateProduct(editId, d); toast('success', 'Produk diperbarui') }
    else { await createProduct(d); toast('success', 'Produk berhasil dibuat') }
    reload()
  }
  const handleToggle = async (p: Product) => {
    await updateProduct(p.id, { is_active: !p.is_active })
    toast('success', p.is_active ? 'Produk dinonaktifkan' : 'Produk diaktifkan')
    reload()
  }
  return { handleSave, handleToggle }
}

export function ProductsPage() {
  const { products, loading, search, setSearch, page, setPage, totalPages, loadData } = useProducts()
  const { handleSave, handleToggle } = useProductActions(loadData)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const columns = getProductColumns((p) => { setSelectedProduct(p); setModalOpen(true) }, handleToggle)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Katalog Produk & Jasa"
        description="Master data komoditas dan layanan seluruh unit usaha"
        actions={<PermissionGate permission="m4.products.manage"><Button onClick={() => { setSelectedProduct(null); setModalOpen(true) }}><Plus size={16} /> Tambah Produk</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari nama produk..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={products} keyExtractor={(p) => String(p.id)} loading={loading} emptyMessage="Belum ada produk terdaftar." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <ProductFormModal open={modalOpen} initial={selectedProduct} onClose={() => setModalOpen(false)} onSubmit={(d) => handleSave(selectedProduct?.id ?? null, d)} />
    </div>
  )
}
