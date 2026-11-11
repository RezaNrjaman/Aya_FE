import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import {
  Button,
  DataTable,
  PageHeader,
  Pagination,
  StatusBadge,
  useToast,
} from '@/components/ui'
import { fetchServiceRequests, updateServiceRequestStatus } from '@/features/m5/api'
import type { ServiceRequest } from '@/features/m5/types'

function statusVariant(status: string) {
  if (status === 'selesai') return 'success'
  if (status === 'diproses') return 'info'
  return 'warning'
}

function RequestActions({ request, onChange }: { request: ServiceRequest; onChange: (r: ServiceRequest, status: 'diproses' | 'selesai') => void }) {
  if (request.status === 'pending') {
    return <Button size="sm" onClick={() => onChange(request, 'diproses')}><Clock size={14} /> Proses</Button>
  }
  if (request.status === 'diproses') {
    return <Button size="sm" variant="secondary" onClick={() => onChange(request, 'selesai')}><CheckCircle2 size={14} /> Selesaikan</Button>
  }
  return <span className="text-xs text-dark-500">Selesai</span>
}

export function ServiceRequestsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchServiceRequests({ page, per_page: 10, status: status || undefined })
      setItems(res.data)
      setTotalPages(res.meta?.total_pages ?? 1)
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal memuat permintaan layanan')
    } finally {
      setLoading(false)
    }
  }, [page, status, toast])

  useEffect(() => { void loadData() }, [loadData])

  const changeStatus = async (request: ServiceRequest, next: 'diproses' | 'selesai') => {
    try {
      await updateServiceRequestStatus(request.id, next)
      toast('success', `Permintaan ${request.id} berhasil diperbarui`)
      await loadData()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal memperbarui status permintaan')
    }
  }

  const columns = [
    {
      key: 'customer', header: 'Customer',
      render: (r: ServiceRequest) => <div><p className="font-medium text-dark-100">{r.customer_name}</p><p className="text-xs text-dark-400">{r.customer_email}</p><p className="text-xs text-dark-500">{r.customer_phone || '—'}</p></div>,
    },
    {
      key: 'request', header: 'Permintaan',
      render: (r: ServiceRequest) => <div className="max-w-sm"><p className="text-sm text-dark-100">{r.service_type || 'Layanan umum'}</p><p className="text-xs text-dark-400 whitespace-normal">{r.description}</p><p className="text-[11px] text-dark-500 mt-1">Unit #{r.unit_usaha_id}</p></div>,
    },
    {
      key: 'status', header: 'Status',
      render: (r: ServiceRequest) => <StatusBadge label={r.status.toUpperCase()} variant={statusVariant(r.status)} />,
    },
    {
      key: 'created_at', header: 'Diterima',
      render: (r: ServiceRequest) => <span className="text-xs text-dark-400">{new Date(r.created_at).toLocaleString('id-ID')}</span>,
    },
    {
      key: 'actions', header: 'Tindakan',
      render: (r: ServiceRequest) => <RequestActions request={r} onChange={changeStatus} />,
    },
  ]

  const filters = [
    { value: '', label: 'Semua status' },
    { value: 'pending', label: 'Pending' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Permintaan Layanan" description="Kelola permintaan layanan yang dikirim customer ke unit usaha perusahaan." actions={<Button variant="secondary" onClick={() => void loadData()}><RefreshCw size={14} /> Muat Ulang</Button>} />
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f.value} onClick={() => { setStatus(f.value); setPage(1) }} className={`rounded-lg px-3 py-1.5 text-xs border ${status === f.value ? 'bg-brand-600/20 border-brand-500/40 text-brand-300' : 'border-glass-border text-dark-300 hover:bg-white/5'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={items} keyExtractor={(r) => String(r.id)} loading={loading} emptyMessage="Belum ada permintaan layanan untuk perusahaan ini." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
