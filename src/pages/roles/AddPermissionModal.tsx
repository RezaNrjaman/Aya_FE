import { useState, type FormEvent } from 'react'
import { Button, Input } from '@/components/ui'
import type { Role } from '@/features/m1/types'

function useAddPermission(role: Role | null, onSubmit: (role: string, key: string) => Promise<void>, onClose: () => void) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!role) return
    setError('')
    setLoading(true)
    try {
      await onSubmit(role.name, key.trim())
      setKey('')
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan permission')
    } finally {
      setLoading(false)
    }
  }
  return { key, setKey, loading, error, submit }
}

export function AddPermissionModal({ role, onClose, onSubmit }: { role: Role | null; onClose: () => void; onSubmit: (role: string, key: string) => Promise<void> }) {
  const { key, setKey, loading, error, submit } = useAddPermission(role, onSubmit, onClose)
  if (!role) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Tambah Hak Akses</h3>
        <p className="text-xs text-dark-400">Role: <strong className="text-dark-200">{role.display_name}</strong></p>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Permission Key" placeholder="contoh: m1.users.read" value={key} onChange={(e) => setKey(e.target.value)} helper="Format: modul.fitur.aksi (contoh: m2.business_units.read)" required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Tambahkan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
