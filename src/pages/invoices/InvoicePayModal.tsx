import { useState, type FormEvent } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Select } from '@/components/ui'
import type { Invoice } from '@/features/m4/types'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const PAYMENT_METHODS = [
  { value: 'sandbox_qris', label: 'QRIS Sandbox (Scan Simulasi)' },
  { value: 'sandbox_va', label: 'Virtual Account Sandbox' },
  { value: 'sandbox_bank_transfer', label: 'Transfer Bank Manual Sandbox' },
]

function usePaySubmit(
  invoice: Invoice | null,
  onPay: (id: number, d: { method: string; amount: number; simulate_failure?: boolean }) => Promise<void>,
  onClose: () => void,
) {
  const [method, setMethod] = useState('sandbox_qris')
  const [failSim, setFailSim] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!invoice) return; setError(''); setLoading(true)
    try { await onPay(invoice.id, { method, amount: invoice.total_amount, simulate_failure: failSim }); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Simulasi pembayaran gagal') }
    finally { setLoading(false) }
  }
  return { method, setMethod, failSim, setFailSim, loading, error, submit }
}

function SandboxAlert() {
  return (
    <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
      <AlertTriangle size={14} /> SIMULASI SANDBOX PAYMENT GATEWAY
    </div>
  )
}

function InvoicePayForm({
  method, setMethod, failSim, setFailSim, loading, submit, onClose
}: {
  method: string; setMethod: (v: string) => void; failSim: boolean; setFailSim: (v: boolean) => void;
  loading: boolean; submit: (e: FormEvent) => void; onClose: () => void
}) {
  return (
    <form onSubmit={submit} className="space-y-4">
      <Select label="Metode Pembayaran Sandbox" value={method} onChange={(e) => setMethod(e.target.value)} options={PAYMENT_METHODS} />
      <label className="flex items-center gap-2 text-xs text-dark-300 cursor-pointer">
        <input type="checkbox" checked={failSim} onChange={(e) => setFailSim(e.target.checked)} className="rounded border-dark-600 bg-dark-900 text-danger" />
        <span>Simulasikan Transaksi Ditolak / Gagal</span>
      </label>
      <div className="flex justify-end gap-2 pt-2"><Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button><Button type="submit" loading={loading}>Proses Pembayaran</Button></div>
    </form>
  )
}

export function InvoicePayModal({ invoice, onClose, onPay }: {
  invoice: Invoice | null; onClose: () => void; onPay: (id: number, d: { method: string; amount: number; simulate_failure?: boolean }) => Promise<void>
}) {
  const { method, setMethod, failSim, setFailSim, loading, error, submit } = usePaySubmit(invoice, onPay, onClose)
  if (!invoice) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <SandboxAlert />
        <div>
          <h3 className="font-heading text-lg font-semibold text-dark-100">Bayar Invoice #{invoice.invoice_no}</h3>
          <p className="text-sm font-semibold text-brand-400 mt-1">{formatRupiah(invoice.total_amount)}</p>
        </div>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <InvoicePayForm method={method} setMethod={setMethod} failSim={failSim} setFailSim={setFailSim} loading={loading} submit={submit} onClose={onClose} />
      </div>
    </div>
  )
}
