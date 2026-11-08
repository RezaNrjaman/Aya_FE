import { useState, useEffect, useCallback } from 'react'
import { Eye, Plus } from 'lucide-react'
import { PageHeader, Button, Input, DataTable, StatusBadge, Pagination, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchAdminOrders, processOrder, completeOrder, cancelOrder, createOrder } from '@/features/m4/api'
import type { Order } from '@/features/m4/types'
import { OrderDetailModal } from './OrderDetailModal'
import { OrderFormModal, type OrderItemRow } from './OrderFormModal'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminOrders({ page, per_page: 10, search })
      setOrders(res.data); setTotalPages(res.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat pesanan') }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { orders, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function getOrderColumns(onDetail: (id: number) => void) {
  return [
    { key: 'no', header: 'No. Order', render: (o: Order) => <span className="font-mono text-xs font-semibold text-brand-400">{o.order_no}</span> },
    { key: 'total', header: 'Total Nilai', render: (o: Order) => <span className="text-xs font-semibold text-dark-100">{formatRupiah(o.total_amount)}</span> },
    {
      key: 'status', header: 'Status',
      render: (o: Order) => {
        const v = o.status === 'selesai' ? 'success' : o.status === 'dibatalkan' ? 'danger' : o.status === 'diproses' ? 'info' : 'warning'
        return <StatusBadge label={o.status.toUpperCase()} variant={v} />
      },
    },
    { key: 'date', header: 'Waktu Dibuat', render: (o: Order) => <span className="text-xs text-dark-400 font-mono">{new Date(o.created_at).toLocaleString('id-ID')}</span> },
    {
      key: 'actions', header: 'Aksi', className: 'text-right',
      render: (o: Order) => <Button size="sm" variant="secondary" onClick={() => onDetail(o.id)} title="Kelola Order"><Eye size={14} /></Button>,
    },
  ]
}

function useOrderTransitions(reload: () => void) {
  const { toast } = useToast()
  const handleCreate = async (d: { customer_id: number; items: OrderItemRow[] }) => {
    await createOrder({ customer_id: d.customer_id, items: d.items, idempotency_key: 'ord_' + Date.now() })
    toast('success', 'Pesanan manual berhasil dibuat'); reload()
  }
  const handleProcess = async (id: number) => { await processOrder(id); toast('success', 'Status diubah ke Diproses'); reload() }
  const handleComplete = async (id: number) => { await completeOrder(id); toast('success', 'Pesanan diselesaikan'); reload() }
  const handleCancel = async (id: number) => { await cancelOrder(id); toast('success', 'Pesanan dibatalkan'); reload() }
  return { handleCreate, handleProcess, handleComplete, handleCancel }
}

export function OrdersPage() {
  const { orders, loading, search, setSearch, page, setPage, totalPages, loadData } = useOrders()
  const { handleCreate, handleProcess, handleComplete, handleCancel } = useOrderTransitions(loadData)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const columns = getOrderColumns(setDetailId)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manajemen Order Transaksi"
        description="Pantau status pemrosesan pesanan dan siklus hidup transaksi"
        actions={<PermissionGate permission="m4.orders.manage"><Button onClick={() => setFormOpen(true)}><Plus size={16} /> Buat Pesanan Manual</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari nomor order..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={orders} keyExtractor={(o) => String(o.id)} loading={loading} emptyMessage="Belum ada pesanan." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <OrderDetailModal id={detailId} onClose={() => setDetailId(null)} onProcess={handleProcess} onComplete={handleComplete} onCancel={handleCancel} />
      <OrderFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
    </div>
  )
}
