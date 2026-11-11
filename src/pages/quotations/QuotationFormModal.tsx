import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input, Select, SearchableSelect } from '@/components/ui'
import { fetchCustomers } from '@/features/m4/api'
import { fetchAllTenantUnits } from '@/features/m2/api'
import type { Customer } from '@/features/m4/types'
import type { BusinessUnit } from '@/features/m2/types'

export interface FormItem { item_name: string; quantity: number; unit_price: number }

function useQuotationOptions(open: boolean) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [unitsError, setUnitsError] = useState('')

  useEffect(() => {
    if (!open) return
    let active = true
    setLoadingUnits(true)
    setUnitsError('')
    Promise.all([
      fetchCustomers({ per_page: 100 }),
      fetchAllTenantUnits(),
    ]).then(([customerResult, unitResult]) => {
      if (!active) return
      setCustomers(Array.isArray(customerResult?.data) ? customerResult.data : [])
      setUnits(Array.isArray(unitResult) ? unitResult : [])
      if (!Array.isArray(unitResult) || unitResult.length === 0) {
        setUnitsError('Belum ada unit usaha aktif yang dapat dipilih. Periksa data Unit Usaha dan hak akses akun Anda.')
      }
    }).catch((err: unknown) => {
      if (!active) return
      setUnits([])
      setCustomers([])
      setUnitsError(err instanceof Error ? err.message : 'Gagal memuat unit usaha. Periksa koneksi dan hak akses M2.')
    }).finally(() => {
      if (active) setLoadingUnits(false)
    })
    return () => { active = false }
  }, [open])

  return { customers, units, loadingUnits, unitsError }
}

function QuotationItemRow({ item, index, onUpdate, onRemove }: {
  item: FormItem; index: number
  onUpdate: (i: number, f: string, v: unknown) => void; onRemove: (i: number) => void
}) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1"><Input placeholder="Nama Item / Jasa" value={item.item_name} onChange={(e) => onUpdate(index, 'item_name', e.target.value)} required /></div>
      <div className="w-24"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value, 10) || 1)} required /></div>
      <div className="w-32"><Input type="number" placeholder="Harga Satuan" value={item.unit_price} onChange={(e) => onUpdate(index, 'unit_price', parseInt(e.target.value, 10) || 0)} required /></div>
      <button type="button" onClick={() => onRemove(index)} className="p-2 text-danger hover:bg-danger/10 rounded"><Trash2 size={16} /></button>
    </div>
  )
}

function useQuotationFormState(
  onSubmit: (d: { unit_usaha_id: number; customer_id: number; items: FormItem[] }) => Promise<void>,
  onClose: () => void,
) {
  const [unitId, setUnitId] = useState('')
  const [custId, setCustId] = useState('')
  const [items, setItems] = useState<FormItem[]>([{ item_name: '', quantity: 1, unit_price: 0 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateItem = (i: number, f: string, v: unknown) => { const copy = [...items]; (copy[i] as unknown as Record<string, unknown>)[f] = v; setItems(copy) }
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)) }
  const addItem = () => setItems([...items, { item_name: '', quantity: 1, unit_price: 0 }])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    const selectedUnitID = Number(unitId)
    const selectedCustomerID = Number(custId)
    if (!Number.isInteger(selectedUnitID) || selectedUnitID <= 0) {
      setError('Pilih unit usaha terlebih dahulu.')
      return
    }
    if (!Number.isInteger(selectedCustomerID) || selectedCustomerID <= 0) {
      setError('Pilih pelanggan terlebih dahulu.')
      return
    }
    setLoading(true)
    try { await onSubmit({ unit_usaha_id: selectedUnitID, customer_id: selectedCustomerID, items }); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal membuat quotation') }
    finally { setLoading(false) }
  }
  return { unitId, setUnitId, custId, setCustId, items, loading, error, updateItem, removeItem, addItem, submit }
}

function QuotationFormFields({ form, units, customers, loadingUnits, unitsError }: {
  form: ReturnType<typeof useQuotationFormState>
  units: BusinessUnit[]
  customers: Customer[]
  loadingUnits: boolean
  unitsError: string
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <SearchableSelect
            label="Unit Usaha"
            value={form.unitId}
            onChange={form.setUnitId}
            options={units.map((u) => ({ value: String(u.id), label: `${u.name}${u.partner_name ? ` · ${u.partner_name}` : ''}` }))}
            placeholder={loadingUnits ? 'Memuat unit usaha...' : units.length ? 'Pilih unit usaha' : 'Tidak ada unit usaha'}
            searchPlaceholder="Cari nama unit usaha..."
            disabled={loadingUnits || units.length === 0}
            required
            emptyMessage="Unit usaha tidak ditemukan"
          />
          {unitsError && <p className="text-xs text-danger">{unitsError}</p>}
        </div>
        <Select label="Pelanggan" value={form.custId} onChange={(e) => form.setCustId(e.target.value)} options={customers.map((c) => ({ value: String(c.id), label: c.name }))} placeholder="Pilih Pelanggan" required />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center"><p className="text-xs font-semibold uppercase text-dark-400">Daftar Item / Komoditas</p><Button size="sm" variant="tertiary" type="button" onClick={form.addItem}><Plus size={14} /> Item</Button></div>
        {form.items.map((it, idx) => <QuotationItemRow key={idx} item={it} index={idx} onUpdate={form.updateItem} onRemove={form.removeItem} />)}
      </div>
    </>
  )
}

export function QuotationFormModal({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (d: { unit_usaha_id: number; customer_id: number; items: FormItem[] }) => Promise<void>
}) {
  const { customers, units, loadingUnits, unitsError } = useQuotationOptions(open)
  const form = useQuotationFormState(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Buat Quotation Baru</h3>
        {form.error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{form.error}</div>}
        <form onSubmit={form.submit} className="space-y-4">
          <QuotationFormFields
            form={form}
            units={units}
            customers={customers}
            loadingUnits={loadingUnits}
            unitsError={unitsError}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={form.loading}>Batal</Button>
            <Button type="submit" loading={form.loading} disabled={loadingUnits || units.length === 0}>Terbitkan Quotation</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
