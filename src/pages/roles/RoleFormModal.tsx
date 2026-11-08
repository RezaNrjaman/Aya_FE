import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/ui'
import type { CreateRoleData } from '@/features/m1/types'

function useRoleForm(onSubmit: (data: CreateRoleData) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState<CreateRoleData>({ name: '', display_name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat role')
    } finally {
      setLoading(false)
    }
  }
  return { form, setForm, loading, error, submit }
}

export function RoleFormModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: CreateRoleData) => Promise<void> }) {
  const { form, setForm, loading, error, submit } = useRoleForm(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Buat Role Baru</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Kode Role" placeholder="contoh: supervisor" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase() })} required />
          <Input label="Nama Tampilan" placeholder="contoh: Supervisor Lapangan" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} required />
          <Textarea label="Deskripsi" placeholder="Tanggung jawab role ini..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
