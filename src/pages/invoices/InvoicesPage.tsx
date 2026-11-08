import { useState, useEffect, useCallback } from 'react'
import { Plus, CreditCard } from 'lucide-react'
import { PageHeader, Button, Input, DataTable, StatusBadge, Pagination, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchInvoices, createInvoice, payInvoice } from '@/features/m4/api'
import type { Invoice } from '@/features/m4/types'
import { InvoiceFormModal } from './InvoiceFormModal'
import { InvoicePayModal } from './InvoicePayModal'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useInvoices() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchInvoices({ page, per_page: 10, search })
      setInvoices(res.data); setTotalPages(res.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat invoice') }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { invoices, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function getInvoiceColumns(onPay: (inv: Invoice) => void) {
  return [
    { key: 'no', header: 'No. Invoice', render: (i: Invoice) => <span className="font-mono text-xs font-semibold text-brand-400">{i.invoice_no}</span> },
    { key: 'total', header: 'Total Tagihan', render: (i: Invoice) => <span className="text-xs font-semibold text-dark-100">{formatRupiah(i.total_amount)}</span> },
    {
      key: 'status', header: 'Status',
      render: (i: Invoice) => <StatusBadge label={i.status.toUpperCase()} variant={i.status === 'lunas' ? 'success' : i.status === 'dibatalkan' ? 'danger' : 'warning'} />,
    },
    { key: 'due', header: 'Jatuh Tempo', render: (i: Invoice) => <span className="text-xs text-dark-400 font-mono">{i.due_date ? new Date(i.due_date).toLocaleDateString('id-ID') : '—'}</span> },
    {
      key: 'actions', header: 'Aksi', className: 'text-right',
      render: (i: Invoice) => i.status === 'belum_lunas' ? (
        <PermissionGate permission="m4.invoices.pay">
          <Button size="sm" variant="primary" onClick={() => onPay(i)} title="Bayar Sandbox"><CreditCard size={14} /> Bayar</Button>
        </PermissionGate>
      ) : null,
    },
  ]
}

function useInvoiceActions(reload: () => void) {
  const { toast } = useToast()
  const handleCreate = async (d: { quotation_id?: number; customer_id: number; items?: { item_name: string; quantity: number; unit_price: number }[] }) => {
    await createInvoice(d); toast('success', 'Invoice berhasil diterbitkan'); reload()
  }
  const handlePay = async (id: number, d: { method: string; amount: number; simulate_failure?: boolean }) => {
    await payInvoice(id, d); toast('success', 'Simulasi pembayaran berhasil diproses'); reload()
  }
  return { handleCreate, handlePay }
}

export function InvoicesPage() {
  const { invoices, loading, search, setSearch, page, setPage, totalPages, loadData } = useInvoices()
  const { handleCreate, handlePay } = useInvoiceActions(loadData)
  const [formOpen, setFormOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<Invoice | null>(null)
  const columns = getInvoiceColumns(setPayTarget)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoice & Penagihan"
        description="Kelola tagihan, piutang transaksi, dan simulasi pembayaran payment gateway"
        actions={<PermissionGate permission="m4.invoices.manage"><Button onClick={() => setFormOpen(true)}><Plus size={16} /> Terbitkan Invoice</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari nomor invoice..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={invoices} keyExtractor={(i) => String(i.id)} loading={loading} emptyMessage="Belum ada invoice." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <InvoiceFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <InvoicePayModal invoice={payTarget} onClose={() => setPayTarget(null)} onPay={handlePay} />
    </div>
  )
}
