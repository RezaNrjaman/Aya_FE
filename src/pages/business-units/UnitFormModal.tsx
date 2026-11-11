import { useState, useEffect, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/ui'
import type { BusinessUnit, CreateUnitData } from '@/features/m2/types'

function useUnitFormState(initial: BusinessUnit | null) {
  const [form, setForm] = useState<CreateUnitData>({
    name: '', description: '',
  })
  useEffect(() => {
    setForm(initial ? {
      name: initial.name, description: initial.description || '',
    } : { name: '', description: '' })
  }, [initial])
  return { form, setForm }
}

export function UnitFormModal({ open, initial, onClose, onSubmit }: {
  open: boolean; initial: BusinessUnit | null; onClose: () => void
  onSubmit: (d: CreateUnitData) => Promise<void>
}) {
  const { form, setForm } = useUnitFormState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (!open) return null
  const execute = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(form); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : 'Gagal menyimpan unit usaha') }
    finally { setLoading(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <h3 className="font-heading text-lg font-semibold text-dark-100">{initial ? 'Edit Unit Usaha' : 'Tambah Unit Usaha Baru'}</h3>
      <p className="text-xs text-dark-400">Kategori, divisi, role, dan pengguna dikelola pada tingkat masing-masing setelah unit usaha dibuat.</p>
      {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
      <form onSubmit={execute} className="space-y-3">
        <Input label="Nama Unit Usaha" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Textarea label="Deskripsi" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
          <Button type="submit" loading={loading}>{initial ? 'Simpan Perubahan' : 'Buat Unit Usaha'}</Button>
        </div>
      </form>
    </div>
  </div>
}
