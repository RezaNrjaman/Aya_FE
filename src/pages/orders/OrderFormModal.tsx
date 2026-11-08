import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { fetchCustomers, fetchAdminProducts } from '@/features/m4/api'
import type { Customer, Product } from '@/features/m4/types'

export interface OrderItemRow { product_id: number; quantity: number }

function useOrderOptions() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    fetchCustomers({ per_page: 50 }).then((r) => setCustomers(r.data)).catch(() => {})
    fetchAdminProducts({ per_page: 50 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [])
  return { customers, products }
}

function OrderItemRowInput({
  item, index, products, onUpdate, onRemove,
}: {
  item: OrderItemRow; index: number; products: Product[]
  onUpdate: (i: number, f: 'product_id' | 'quantity', v: number) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <Select
          value={item.product_id ? String(item.product_id) : ''}
          onChange={(e) => onUpdate(index, 'product_id', parseInt(e.target.value, 10) || 0)}
          options={products.map((p) => ({ value: String(p.id), label: `${p.name} (Stok: ${p.stock})` }))}
          placeholder="Pilih Produk"
          required
        />
      </div>
      <div className="w-24">
        <Input
          type="number"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value, 10) || 1)}
          required
        />
      </div>
      <button type="button" onClick={() => onRemove(index)} className="p-2 text-danger hover:bg-danger/10 rounded">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function useOrderFormState(
  onSubmit: (d: { customer_id: number; items: OrderItemRow[] }) => Promise<void>,
  onClose: () => void,
) {
  const [custId, setCustId] = useState('')
  const [items, setItems] = useState<OrderItemRow[]>([{ product_id: 0, quantity: 1 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateItem = (i: number, f: 'product_id' | 'quantity', v: number) => {
    const copy = [...items]; copy[i][f] = v; setItems(copy)
  }
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)) }
  const addItem = () => setItems([...items, { product_id: 0, quantity: 1 }])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await onSubmit({ customer_id: parseInt(custId, 10), items: items.filter((it) => it.product_id > 0) })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat order')
    } finally { setLoading(false) }
  }
  return { custId, setCustId, items, loading, error, updateItem, removeItem, addItem, submit }
}

export function OrderFormModal({
  open, onClose, onSubmit,
}: {
  open: boolean; onClose: () => void
  onSubmit: (d: { customer_id: number; items: OrderItemRow[] }) => Promise<void>
}) {
  const { customers, products } = useOrderOptions()
  const form = useOrderFormState(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Buat Pesanan Baru</h3>
        {form.error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{form.error}</div>}
        <form onSubmit={form.submit} className="space-y-4">
          <Select
            label="Pelanggan"
            value={form.custId}
            onChange={(e) => form.setCustId(e.target.value)}
            options={customers.map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder="Pilih Pelanggan"
            required
          />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold uppercase text-dark-400">Daftar Produk</p>
              <Button size="sm" variant="tertiary" type="button" onClick={form.addItem}><Plus size={14} /> Item</Button>
            </div>
            {form.items.map((it, idx) => (
              <OrderItemRowInput
                key={idx}
                item={it}
                index={idx}
                products={products}
                onUpdate={form.updateItem}
                onRemove={form.removeItem}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={form.loading}>Batal</Button>
            <Button type="submit" loading={form.loading}>Simpan Pesanan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

