import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button, StatusBadge } from '@/components/ui'
import { getQuotation } from '@/features/m4/api'
import type { Quotation } from '@/features/m4/types'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useQuotationDetail(id: number | null) {
  const [data, setData] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!id) { setData(null); return }
    setLoading(true)
    getQuotation(id).then((q) => setData(q)).catch(() => {}).finally(() => setLoading(false))
  }, [id])
  return { data, loading }
}

function QuotationItemsTable({ q }: { q: Quotation }) {
  return (
    <div className="overflow-x-auto rounded border border-glass-border">
      <table className="w-full text-xs text-left">
        <thead className="bg-white/[0.02] border-b border-glass-border text-dark-400">
          <tr><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Harga</th><th className="p-2 text-right">Subtotal</th></tr>
        </thead>
        <tbody>
          {q.items?.map((it, idx) => (
            <tr key={idx} className="border-b border-glass-border/40">
              <td className="p-2 font-medium text-dark-200">{it.item_name}</td>
              <td className="p-2 text-dark-300">{it.quantity}</td>
              <td className="p-2 text-dark-300">{formatRupiah(it.unit_price)}</td>
              <td className="p-2 text-right font-medium text-dark-100">{formatRupiah(it.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuotationSummary({ q }: { q: Quotation }) {
  return (
    <div className="space-y-3">
      <QuotationItemsTable q={q} />
      <div className="flex justify-between items-center pt-2 text-sm font-semibold text-dark-100">
        <span>Total Penawaran:</span><span className="text-brand-400 font-mono text-base">{formatRupiah(q.total_amount)}</span>
      </div>
    </div>
  )
}

function QuotationModalFooter({ q, acting, onClose, onAction }: {
  q: Quotation | null; acting: boolean; onClose: () => void; onAction: (a: 'approve' | 'reject') => void
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="tertiary" onClick={onClose} disabled={acting}>Tutup</Button>
      {q && (q.status === 'draft' || q.status === 'diajukan') && (
        <>
          <Button variant="danger" onClick={() => onAction('reject')} loading={acting}><XCircle size={14} /> Tolak</Button>
          <Button variant="primary" onClick={() => onAction('approve')} loading={acting}><CheckCircle2 size={14} /> Setujui</Button>
        </>
      )}
    </div>
  )
}

function useQuotationAction(
  id: number | null, onApprove: (id: number) => Promise<void>, onReject: (id: number) => Promise<void>, onClose: () => void
) {
  const [acting, setActing] = useState(false)
  const handleAction = async (action: 'approve' | 'reject') => {
    if (!id) return
    setActing(true)
    try { if (action === 'approve') await onApprove(id); else await onReject(id); onClose() }
    finally { setActing(false) }
  }
  return { acting, handleAction }
}

export function QuotationDetailModal({ id, onClose, onApprove, onReject }: {
  id: number | null; onClose: () => void; onApprove: (id: number) => Promise<void>; onReject: (id: number) => Promise<void>
}) {
  const { data: q, loading } = useQuotationDetail(id)
  const { acting, handleAction } = useQuotationAction(id, onApprove, onReject, onClose)
  if (!id) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-heading text-lg font-semibold text-dark-100">Quotation #{q?.quotation_no}</h3>
          {q && <StatusBadge label={q.status.toUpperCase()} variant={q.status === 'disetujui' ? 'success' : q.status === 'ditolak' ? 'danger' : 'warning'} />}
        </div>
        {loading && <p className="text-xs text-center py-4 text-dark-400">Memuat rincian...</p>}
        {q && <QuotationSummary q={q} />}
        <QuotationModalFooter q={q} acting={acting} onClose={onClose} onAction={handleAction} />
      </div>
    </div>
  )
}
