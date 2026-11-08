import { useState, useEffect, useCallback } from 'react'
import { Plus, Eye } from 'lucide-react'
import { PageHeader, Button, Input, DataTable, StatusBadge, Pagination, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchQuotations, createQuotation, approveQuotation, rejectQuotation } from '@/features/m4/api'
import type { Quotation } from '@/features/m4/types'
import { QuotationFormModal } from './QuotationFormModal'
import { QuotationDetailModal } from './QuotationDetailModal'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useQuotations() {
  const { toast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchQuotations({ page, per_page: 10, search })
      setQuotations(res.data); setTotalPages(res.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat quotation') }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { quotations, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function getQuotationColumns(onDetail: (id: number) => void) {
  return [
    { key: 'no', header: 'No. Quotation', render: (q: Quotation) => <span className="font-mono text-xs font-semibold text-brand-400">{q.quotation_no}</span> },
    { key: 'total', header: 'Total Nilai', render: (q: Quotation) => <span className="text-xs font-semibold text-dark-100">{formatRupiah(q.total_amount)}</span> },
    {
      key: 'status', header: 'Status',
      render: (q: Quotation) => {
        const v = q.status === 'disetujui' ? 'success' : q.status === 'ditolak' ? 'danger' : 'warning'
        return <StatusBadge label={q.status.toUpperCase()} variant={v} />
      },
    },
    { key: 'date', header: 'Tanggal', render: (q: Quotation) => <span className="text-xs text-dark-400 font-mono">{new Date(q.created_at).toLocaleDateString('id-ID')}</span> },
    {
      key: 'actions', header: 'Aksi', className: 'text-right',
      render: (q: Quotation) => <Button size="sm" variant="secondary" onClick={() => onDetail(q.id)} title="Lihat"><Eye size={14} /></Button>,
    },
  ]
}

function useQuotationOperations(reload: () => void) {
  const { toast } = useToast()
  const handleCreate = async (d: { unit_usaha_id: number; customer_id: number; items: { item_name: string; quantity: number; unit_price: number }[] }) => {
    await createQuotation(d); toast('success', 'Quotation berhasil diterbitkan'); reload()
  }
  const handleApprove = async (id: number) => { await approveQuotation(id); toast('success', 'Quotation disetujui'); reload() }
  const handleReject = async (id: number) => { await rejectQuotation(id); toast('success', 'Quotation ditolak'); reload() }
  return { handleCreate, handleApprove, handleReject }
}

export function QuotationsPage() {
  const { quotations, loading, search, setSearch, page, setPage, totalPages, loadData } = useQuotations()
  const { handleCreate, handleApprove, handleReject } = useQuotationOperations(loadData)
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const columns = getQuotationColumns(setDetailId)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotation & Penawaran"
        description="Kelola draf penawaran harga dan alur persetujuan klien"
        actions={<PermissionGate permission="m4.quotations.manage"><Button onClick={() => setFormOpen(true)}><Plus size={16} /> Buat Quotation</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari nomor penawaran..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={quotations} keyExtractor={(q) => String(q.id)} loading={loading} emptyMessage="Belum ada quotation." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <QuotationFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <QuotationDetailModal id={detailId} onClose={() => setDetailId(null)} onApprove={handleApprove} onReject={handleReject} />
    </div>
  )
}
