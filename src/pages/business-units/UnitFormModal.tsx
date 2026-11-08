import { useState, useEffect, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import type { BusinessUnit, CreateUnitData } from '@/features/m2/types'

const CATEGORY_OPTIONS = [
  { value: 'Konstruksi & Bangunan', label: 'Konstruksi & Bangunan' },
  { value: 'Teknologi & Solusi Digital', label: 'Teknologi & Solusi Digital' },
  { value: 'Perdagangan & Suplai', label: 'Perdagangan & Suplai' },
  { value: 'Jasa & Konsultansi Bisnis', label: 'Jasa & Konsultansi Bisnis' },
]

function useUnitFormState(initial: BusinessUnit | null) {
  const [form, setForm] = useState<CreateUnitData>({
    name: '', category: 'Konstruksi & Bangunan', division: 'Operasional & Bisnis',
    description: '', contact_email: '', contact_phone: '', address: '',
  })
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name, category: initial.category || 'Konstruksi & Bangunan',
        division: initial.division || 'Operasional & Bisnis', description: initial.description || '',
        contact_email: initial.contact_email || '', contact_phone: initial.contact_phone || '',
        address: initial.address || '',
      })
    } else {
      setForm({
        name: '', category: 'Konstruksi & Bangunan', division: 'Operasional & Bisnis',
        description: '', contact_email: '', contact_phone: '', address: '',
      })
    }
  }, [initial])
  return { form, setForm }
}

function useUnitSubmit(onSubmit: (d: CreateUnitData) => Promise<void>, onClose: () => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const execute = async (form: CreateUnitData, e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal menyimpan unit usaha') }
    finally { setLoading(false) }
  }
  return { loading, error, execute }
}

function UnitFormInputs({ form, setForm }: { form: CreateUnitData; setForm: (f: CreateUnitData) => void }) {
  return (
    <>
      <Input label="Nama Unit Usaha" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Select label="Kategori Bisnis" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email Kontak" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        <Input label="Telepon Kontak" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
      </div>
      <Textarea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Input label="Alamat Kantor" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
    </>
  )
}

export function UnitFormModal({ open, initial, onClose, onSubmit }: { open: boolean; initial: BusinessUnit | null; onClose: () => void; onSubmit: (d: CreateUnitData) => Promise<void> }) {
  const { form, setForm } = useUnitFormState(initial)
  const { loading, error, execute } = useUnitSubmit(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-heading text-lg font-semibold text-dark-100">{initial ? 'Edit Unit Usaha' : 'Tambah Unit Usaha Baru'}</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={(e) => execute(form, e)} className="space-y-3">
          <UnitFormInputs form={form} setForm={setForm} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>{initial ? 'Simpan Perubahan' : 'Buat Unit Usaha'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
