import { useState, type FormEvent } from 'react'
import { Button, Input, Select } from '@/components/ui'
import type { CreateUserData } from '@/features/m1/types'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super Administrator' },
  { value: 'staff', label: 'Staff Operasional' },
  { value: 'partner', label: 'Mitra Bisnis' },
  { value: 'customer', label: 'Pelanggan Portal' },
]

function useUserForm(onSubmit: (data: CreateUserData) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState<CreateUserData>({ name: '', email: '', password: '', phone: '', role: 'staff' })
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
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengguna')
    } finally {
      setLoading(false)
    }
  }
  return { form, setForm, loading, error, submit }
}

export function UserFormModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: CreateUserData) => Promise<void> }) {
  const { form, setForm, loading, error, submit } = useUserForm(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Tambah Pengguna Baru</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password Awal" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Nomor Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={ROLE_OPTIONS} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
