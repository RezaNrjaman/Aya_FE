import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { fetchCustomers, fetchQuotations } from '@/features/m4/api'
import type { Customer, Quotation } from '@/features/m4/types'

export interface FormItem { item_name: string; quantity: number; unit_price: number }

function useInvoiceOptions() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  useEffect(() => {
    fetchCustomers({ per_page: 50 }).then((r) => setCustomers(r.data)).catch(() => {})
    fetchQuotations({ per_page: 50 }).then((r) => setQuotations(r.data.filter((q) => q.status === 'disetujui'))).catch(() => {})
  }, [])
  return { customers, quotations }
}

function InvoiceItemRow({ item, index, onUpdate, onRemove }: {
  item: FormItem; index: number; onUpdate: (i: number, f: string, v: unknown) => void; onRemove: (i: number) => void
}) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1"><Input placeholder="Nama Item" value={item.item_name} onChange={(e) => onUpdate(index, 'item_name', e.target.value)} required /></div>
      <div className="w-24"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value, 10) || 1)} required /></div>
      <div className="w-32"><Input type="number" placeholder="Harga" value={item.unit_price} onChange={(e) => onUpdate(index, 'unit_price', parseInt(e.target.value, 10) || 0)} required /></div>
      <button type="button" onClick={() => onRemove(index)} className="p-2 text-danger hover:bg-danger/10 rounded"><Trash2 size={16} /></button>
    </div>
  )
}

function InvoiceItemsBlock({ qId, items, setItems, onUpdate }: {
  qId: string; items: FormItem[]; setItems: (i: FormItem[]) => void; onUpdate: (i: number, f: string, v: unknown) => void
}) {
  if (qId) return null
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center"><p className="text-xs font-semibold uppercase text-dark-400">Item Penagihan</p><Button size="sm" variant="tertiary" type="button" onClick={() => setItems([...items, { item_name: '', quantity: 1, unit_price: 0 }])}><Plus size={14} /> Item</Button></div>
      {items.map((it, idx) => <InvoiceItemRow key={idx} item={it} index={idx} onUpdate={onUpdate} onRemove={(i) => setItems(items.filter((_, x) => x !== i))} />)}
    </div>
  )
}

function useInvoiceFormState(
  onSubmit: (d: { quotation_id?: number; customer_id: number; items?: FormItem[] }) => Promise<void>,
  onClose: () => void,
) {
  const [qId, setQId] = useState('')
  const [custId, setCustId] = useState('')
  const [items, setItems] = useState<FormItem[]>([{ item_name: '', quantity: 1, unit_price: 0 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateItem = (i: number, f: string, v: unknown) => { const c = [...items]; (c[i] as unknown as Record<string, unknown>)[f] = v; setItems(c) }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const qNum = qId ? parseInt(qId, 10) : undefined
      await onSubmit({ quotation_id: qNum, customer_id: parseInt(custId, 10), items: qNum ? undefined : items }); onClose()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal membuat invoice') }
    finally { setLoading(false) }
  }
  return { qId, setQId, custId, setCustId, items, setItems, loading, error, updateItem, submit }
}

function InvoiceSelects({ qId, setQId, custId, setCustId, quotations, customers }: {
  qId: string; setQId: (v: string) => void; custId: string; setCustId: (v: string) => void; quotations: Quotation[]; customers: Customer[]
}) {
  return (
    <>
      <Select label="Dari Quotation Disetujui (Opsional)" value={qId} onChange={(e) => setQId(e.target.value)} options={quotations.map((q) => ({ value: String(q.id), label: `${q.quotation_no} (Rp ${q.total_amount.toLocaleString('id-ID')})` }))} placeholder="Invoice Langsung Tanpa Quotation" />
      <Select label="Pelanggan" value={custId} onChange={(e) => setCustId(e.target.value)} options={customers.map((c) => ({ value: String(c.id), label: c.name }))} placeholder="Pilih Pelanggan" required />
    </>
  )
}

export function InvoiceFormModal({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (d: { quotation_id?: number; customer_id: number; items?: FormItem[] }) => Promise<void>
}) {
  const { customers, quotations } = useInvoiceOptions()
  const form = useInvoiceFormState(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Terbitkan Invoice Baru</h3>
        {form.error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{form.error}</div>}
        <form onSubmit={form.submit} className="space-y-4">
          <InvoiceSelects qId={form.qId} setQId={form.setQId} custId={form.custId} setCustId={form.setCustId} quotations={quotations} customers={customers} />
          <InvoiceItemsBlock qId={form.qId} items={form.items} setItems={form.setItems} onUpdate={form.updateItem} />
          <div className="flex justify-end gap-2 pt-2"><Button variant="tertiary" type="button" onClick={onClose} disabled={form.loading}>Batal</Button><Button type="submit" loading={form.loading}>Terbitkan Invoice</Button></div>
        </form>
      </div>
    </div>
  )
}
