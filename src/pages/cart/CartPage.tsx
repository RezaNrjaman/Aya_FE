/** M5-006 / M5-007 / M5-008: Shopping Cart & Checkout Page */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus, CheckCircle, ArrowRight } from 'lucide-react'
import { Button, Input, Textarea, useToast } from '@/components/ui'
import { useCart } from '@/features/m5/CartContext'
import { checkoutCart } from '@/features/m5/api'
import type { CartItem, CheckoutResult } from '@/features/m5/types'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function EmptyCartView() {
  return (
    <div className="glass-card text-center py-16 px-4 rounded-2xl max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
        <ShoppingBag size={32} />
      </div>
      <div>
        <h2 className="font-heading text-lg font-bold text-dark-100">Keranjang Belanja Kosong</h2>
        <p className="text-xs text-dark-400 mt-1">Anda belum menambahkan komoditas atau layanan ke keranjang.</p>
      </div>
      <Link to="/catalog"><Button variant="primary"><ArrowRight size={14} /> Jelajahi Katalog Sekarang</Button></Link>
    </div>
  )
}

function CartItemRow({
  it, onUpdate, onRemove,
}: {
  it: CartItem; onUpdate: (pid: number, qty: number) => void; onRemove: (pid: number) => void
}) {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="space-y-0.5">
        <h4 className="font-semibold text-sm text-dark-100">{it.item_name}</h4>
        <p className="font-mono text-xs text-dark-400">{formatRupiah(it.unit_price)} / unit</p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-1.5 border border-glass-border rounded-lg bg-dark-900/60 p-1">
          <button type="button" onClick={() => onUpdate(it.product_id, Math.max(1, it.quantity - 1))} className="p-1 text-dark-300 hover:text-dark-100 rounded"><Minus size={14} /></button>
          <span className="font-mono text-xs w-8 text-center text-dark-100 font-semibold">{it.quantity}</span>
          <button type="button" onClick={() => onUpdate(it.product_id, it.quantity + 1)} className="p-1 text-dark-300 hover:text-dark-100 rounded"><Plus size={14} /></button>
        </div>
        <p className="font-mono font-bold text-sm text-brand-400 min-w-24 text-right">{formatRupiah(it.subtotal)}</p>
        <button type="button" onClick={() => onRemove(it.product_id)} className="p-2 text-danger hover:bg-danger/10 rounded transition-colors"><Trash2 size={16} /></button>
      </div>
    </div>
  )
}

function CheckoutCard({
  totalAmount, totalItems, onCheckout, loading,
}: {
  totalAmount: number; totalItems: number; onCheckout: (custId: number, notes: string) => Promise<void>; loading: boolean
}) {
  const [custId, setCustId] = useState('1')
  const [notes, setNotes] = useState('')
  const submit = (e: FormEvent) => { e.preventDefault(); onCheckout(parseInt(custId, 10) || 1, notes) }

  return (
    <form onSubmit={submit} className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-heading text-base font-bold text-dark-100">Ringkasan & Checkout</h3>
      <div className="space-y-2 text-xs border-b border-glass-border/40 pb-3">
        <div className="flex justify-between text-dark-400"><span>Total Komoditas:</span><span className="font-mono text-dark-200">{totalItems} item</span></div>
        <div className="flex justify-between text-dark-100 font-semibold text-sm"><span>Total Tagihan:</span><span className="font-mono text-brand-400 text-base">{formatRupiah(totalAmount)}</span></div>
      </div>
      <Input label="ID Pelanggan (B2B Client ID)" type="number" value={custId} onChange={(e) => setCustId(e.target.value)} required />
      <Textarea label="Catatan Pesanan (Opsional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instruksi pengiriman atau rincian PO..." />
      <Button type="submit" variant="primary" className="w-full" loading={loading}><CheckCircle size={16} /> Buat Pesanan Resmi</Button>
    </form>
  )
}

function CheckoutSuccessModal({ result, onClose }: { result: CheckoutResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="glass-card w-full max-w-md p-6 space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-success/20 border border-success/40 text-success flex items-center justify-center mx-auto"><CheckCircle size={28} /></div>
        <h3 className="font-heading text-lg font-bold text-dark-100">Pesanan Berhasil Dibuat!</h3>
        <p className="text-xs text-dark-300">Nomor Pesanan: <span className="font-mono font-bold text-brand-400">{result.order_no}</span></p>
        <p className="text-xs text-dark-300">Total Tagihan: <span className="font-mono font-bold text-dark-100">{formatRupiah(result.total_amount)}</span></p>
        <div className="pt-2"><Button variant="primary" className="w-full" onClick={onClose}>Selesai & Lanjut Belanja</Button></div>
      </div>
    </div>
  )
}

function useCheckoutHandler(reload: () => Promise<void>) {
  const { toast } = useToast()
  const [checkingOut, setCheckingOut] = useState(false)
  const [result, setResult] = useState<CheckoutResult | null>(null)

  const handleCheckout = async (customerId: number, notes: string) => {
    setCheckingOut(true)
    try {
      const key = 'checkout-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
      const res = await checkoutCart({ customer_id: customerId, notes, idempotency_key: key })
      setResult(res); await reload(); toast('success', `Pesanan ${res.order_no} berhasil dibuat!`)
    } catch (err: unknown) { toast('error', err instanceof Error ? err.message : 'Checkout gagal') }
    finally { setCheckingOut(false) }
  }
  return { checkingOut, result, setResult, handleCheckout }
}

export function CartPage() {
  const nav = useNavigate()
  const { cart, updateItem, removeItem, clearAll, refreshCart } = useCart()
  const { checkingOut, result, setResult, handleCheckout } = useCheckoutHandler(refreshCart)
  if (!cart || cart.items.length === 0) return <EmptyCartView />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="font-heading text-2xl font-bold text-dark-100">Keranjang Belanja</h1><p className="text-xs text-dark-400">Tinjau item yang Anda pilih sebelum checkout</p></div>
        <Button size="sm" variant="danger" onClick={clearAll}><Trash2 size={14} /> Kosongkan</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((it) => <CartItemRow key={it.id || it.product_id} it={it} onUpdate={updateItem} onRemove={removeItem} />)}
        </div>
        <div><CheckoutCard totalAmount={cart.total_amount} totalItems={cart.total_items} onCheckout={handleCheckout} loading={checkingOut} /></div>
      </div>
      {result && <CheckoutSuccessModal result={result} onClose={() => { setResult(null); nav('/catalog') }} />}
    </div>
  )
}
