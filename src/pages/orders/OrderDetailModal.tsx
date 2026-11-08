import { useState, useEffect } from 'react'
import { CheckCircle2, Play, XCircle } from 'lucide-react'
import { Button, StatusBadge } from '@/components/ui'
import { getOrder } from '@/features/m4/api'
import type { Order } from '@/features/m4/types'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useOrderDetail(id: number | null) {
  const [data, setData] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!id) { setData(null); return }
    setLoading(true)
    getOrder(id).then((o) => setData(o)).catch(() => {}).finally(() => setLoading(false))
  }, [id])
  return { data, loading }
}

function OrderItemsTable({ o }: { o: Order }) {
  return (
    <div className="overflow-x-auto rounded border border-glass-border">
      <table className="w-full text-xs text-left">
        <thead className="bg-white/[0.02] border-b border-glass-border text-dark-400">
          <tr><th className="p-2">Item Produk</th><th className="p-2">Qty</th><th className="p-2">Harga</th><th className="p-2 text-right">Subtotal</th></tr>
        </thead>
        <tbody>
          {o.items?.map((it, idx) => (
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

interface ActionProps {
  o: Order; acting: boolean
  onProcess: (id: number) => Promise<void>; onComplete: (id: number) => Promise<void>; onCancel: (id: number) => Promise<void>
  onClose: () => void
}

function OrderTransitions({ o, acting, onProcess, onComplete, onCancel, onClose }: ActionProps) {
  const run = async (fn: (id: number) => Promise<void>) => { await fn(o.id); onClose() }
  if (o.status === 'baru') {
    return (
      <div className="flex gap-2">
        <Button variant="danger" size="sm" onClick={() => run(onCancel)} loading={acting}><XCircle size={14} /> Batalkan</Button>
        <Button variant="primary" size="sm" onClick={() => run(onProcess)} loading={acting}><Play size={14} /> Proses</Button>
      </div>
    )
  }
  if (o.status === 'diproses') {
    return (
      <div className="flex gap-2">
        <Button variant="danger" size="sm" onClick={() => run(onCancel)} loading={acting}><XCircle size={14} /> Batalkan</Button>
        <Button variant="primary" size="sm" onClick={() => run(onComplete)} loading={acting}><CheckCircle2 size={14} /> Selesaikan</Button>
      </div>
    )
  }
  return null
}

function OrderContent({ o }: { o: Order }) {
  return (
    <div className="space-y-3">
      <OrderItemsTable o={o} />
      <div className="flex justify-between items-center pt-2 text-sm font-semibold text-dark-100">
        <span>Total Nilai Pesanan:</span><span className="text-brand-400 font-mono text-base">{formatRupiah(o.total_amount)}</span>
      </div>
    </div>
  )
}

export function OrderDetailModal({ id, onClose, onProcess, onComplete, onCancel }: { id: number | null; onClose: () => void; onProcess: (id: number) => Promise<void>; onComplete: (id: number) => Promise<void>; onCancel: (id: number) => Promise<void> }) {
  const { data: o, loading } = useOrderDetail(id)
  const [acting, setActing] = useState(false)
  if (!id) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-heading text-lg font-semibold text-dark-100">Pesanan #{o?.order_no}</h3>
          {o && <StatusBadge label={o.status.toUpperCase()} variant={o.status === 'selesai' ? 'success' : o.status === 'dibatalkan' ? 'danger' : 'warning'} />}
        </div>
        {loading && <p className="text-xs text-center py-4 text-dark-400">Memuat rincian...</p>}
        {o && <OrderContent o={o} />}
        <div className="flex justify-between items-center pt-2">
          <Button variant="tertiary" onClick={onClose} disabled={acting}>Tutup</Button>
          {o && <OrderTransitions o={o} acting={acting} onProcess={onProcess} onComplete={onComplete} onCancel={onCancel} onClose={onClose} />}
        </div>
      </div>
    </div>
  )
}
