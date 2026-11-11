import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, CreditCard, PackageCheck, Clock3 } from 'lucide-react'
import { Button, Input, Select, StatusBadge } from '@/components/ui'
import { trackPublicOrder, payPublicOrder, type PublicOrderTracking } from '@/features/m5/api'

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export function TrackOrderPage() {
  const [params] = useSearchParams()
  const [orderNo, setOrderNo] = useState(params.get('order_no') || '')
  const [email, setEmail] = useState(params.get('email') || sessionStorage.getItem('araya_last_customer_email') || '')
  const [method, setMethod] = useState('sandbox_qris')
  const [data, setData] = useState<PublicOrderTracking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  const search = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true); setError('')
    try { setData(await trackPublicOrder(orderNo.trim(), email.trim())) }
    catch { setData(null); setError('Pesanan tidak ditemukan. Periksa nomor pesanan dan email checkout.') }
    finally { setLoading(false) }
  }

  const pay = async () => {
    setPaying(true); setError('')
    try {
      await payPublicOrder(orderNo.trim(), email.trim(), method)
      setData(await trackPublicOrder(orderNo.trim(), email.trim()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pembayaran gagal diproses')
    } finally { setPaying(false) }
  }

  const order = data?.order
  const invoice = data?.invoice
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold text-dark-100">Lacak Pesanan</h1>
        <p className="text-sm text-dark-400">Masukkan nomor pesanan dan email yang digunakan saat checkout. Tidak perlu membuat akun.</p>
      </div>
      <form onSubmit={search} className="glass-card rounded-xl p-5 space-y-3">
        <Input label="Nomor Pesanan" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="ORD-20261111-000001" required />
        <Input label="Email Checkout" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full"><Search size={16}/> Cari Pesanan</Button>
      </form>
      {error && <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
      {order && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-xs text-dark-400">Nomor Pesanan</p><p className="font-mono font-bold text-brand-400">{order.order_no}</p></div>
            <StatusBadge label={order.status.toUpperCase()} variant={order.status === 'selesai' ? 'success' : order.status === 'dibatalkan' ? 'danger' : order.status === 'diproses' ? 'info' : 'warning'} />
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold text-dark-100 flex items-center gap-2"><PackageCheck size={16}/> Rincian Pesanan</h2>
            {(order.items || []).map((item) => <div key={item.id} className="flex justify-between text-sm gap-3"><span>{item.item_name} × {item.quantity}</span><span>{rupiah(item.subtotal)}</span></div>)}
            <div className="border-t border-glass-border pt-3 flex justify-between font-bold"><span>Total</span><span className="text-brand-400">{rupiah(order.total_amount)}</span></div>
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold text-dark-100 flex items-center gap-2"><Clock3 size={16}/> Riwayat Status</h2>
            {(order.histories || []).map((h, i) => <div key={`${h.to_status}-${i}`} className="flex justify-between gap-3 text-xs text-dark-300"><span>{h.to_status} {h.reason ? `— ${h.reason}` : ''}</span><span>{new Date(h.created_at).toLocaleString('id-ID')}</span></div>)}
          </div>
          {invoice && (
            <div className="rounded-lg border border-glass-border p-4 space-y-3">
              <div className="flex justify-between gap-2"><span className="text-sm">Invoice {invoice.invoice_no}</span><StatusBadge label={invoice.status.toUpperCase()} variant={invoice.status === 'lunas' ? 'success' : invoice.status === 'dibatalkan' ? 'danger' : 'warning'} /></div>
              {invoice.status === 'belum_lunas' && (
                <>
                  <Select label="Metode Pembayaran (Sandbox)" value={method} onChange={(e) => setMethod(e.target.value)} options={[{value:'sandbox_qris',label:'QRIS Sandbox'},{value:'sandbox_va',label:'Virtual Account Sandbox'},{value:'sandbox_bank_transfer',label:'Transfer Bank Sandbox'}]} />
                  <Button onClick={pay} loading={paying} className="w-full"><CreditCard size={16}/> Bayar Sekarang</Button>
                </>
              )}
              <p className="text-xs text-dark-400">Status pembayaran: {invoice.status === 'lunas' ? 'Pembayaran berhasil diterima.' : 'Menunggu pembayaran.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
