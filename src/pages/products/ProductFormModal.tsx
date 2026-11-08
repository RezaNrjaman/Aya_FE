import { useState, useEffect, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { fetchActiveUnits } from '@/features/m2/api'
import type { BusinessUnit } from '@/features/m2/types'
import type { Product, CreateProductData } from '@/features/m4/types'

function useProductForm(initial: Product | null, onSubmit: (d: CreateProductData) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState<CreateProductData>({ unit_usaha_id: 1, name: '', category: 'Barang', description: '', price: 0, stock: 0 })
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchActiveUnits().then((u) => { setUnits(u); if (u.length > 0 && !initial) setForm((f) => ({ ...f, unit_usaha_id: u[0].id })) }).catch(() => {})
    if (initial) {
      setForm({ unit_usaha_id: initial.unit_usaha_id, name: initial.name, category: initial.category || 'Barang', description: initial.description || '', price: initial.price, stock: initial.stock })
    }
  }, [initial])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal menyimpan produk') }
    finally { setLoading(false) }
  }
  return { form, setForm, units, loading, error, submit }
}

function ProductFields({ form, setForm, units }: { form: CreateProductData; setForm: (f: CreateProductData) => void; units: BusinessUnit[] }) {
  const unitOpts = units.map((u) => ({ value: String(u.id), label: u.name }))
  return (
    <>
      <Input label="Nama Produk / Layanan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Unit Usaha Pemilik" value={String(form.unit_usaha_id)} onChange={(e) => setForm({ ...form, unit_usaha_id: parseInt(e.target.value, 10) })} options={unitOpts} />
        <Input label="Kategori" placeholder="contoh: Material / Software" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Harga (Rupiah)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value, 10) || 0 })} required />
        <Input label="Stok Tersedia" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })} required />
      </div>
      <Textarea label="Deskripsi Produk" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
    </>
  )
}

export function ProductFormModal({ open, initial, onClose, onSubmit }: { open: boolean; initial: Product | null; onClose: () => void; onSubmit: (d: CreateProductData) => Promise<void> }) {
  const { form, setForm, units, loading, error, submit } = useProductForm(initial, onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-heading text-lg font-semibold text-dark-100">{initial ? 'Edit Produk / Layanan' : 'Tambah Produk / Layanan'}</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <ProductFields form={form} setForm={setForm} units={units} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>{initial ? 'Simpan Perubahan' : 'Buat Produk'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

