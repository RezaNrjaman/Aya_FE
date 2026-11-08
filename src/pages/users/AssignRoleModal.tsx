import { useState, type FormEvent } from 'react'
import { Button, Input, Select } from '@/components/ui'
import type { User, AssignRoleData } from '@/features/m1/types'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super Administrator' },
  { value: 'staff', label: 'Staff Operasional' },
  { value: 'partner', label: 'Mitra Bisnis' },
  { value: 'customer', label: 'Pelanggan Portal' },
]

function useAssignRole(user: User | null, onSubmit: (id: number, d: AssignRoleData) => Promise<void>, onClose: () => void) {
  const [roleName, setRoleName] = useState(user?.role ?? 'staff')
  const [unitUsahaId, setUnitUsahaId] = useState(user?.unit_usaha_id ? String(user.unit_usaha_id) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)
    try {
      const scope = unitUsahaId ? parseInt(unitUsahaId, 10) : undefined
      await onSubmit(user.id, { role_name: roleName, unit_usaha_id: scope })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menetapkan role')
    } finally {
      setLoading(false)
    }
  }
  return { roleName, setRoleName, unitUsahaId, setUnitUsahaId, loading, error, submit }
}

export function AssignRoleModal({ user, onClose, onSubmit }: { user: User | null; onClose: () => void; onSubmit: (id: number, d: AssignRoleData) => Promise<void> }) {
  const { roleName, setRoleName, unitUsahaId, setUnitUsahaId, loading, error, submit } = useAssignRole(user, onSubmit, onClose)
  if (!user) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Tetapkan Role & Scope</h3>
        <p className="text-xs text-dark-400">Pengguna: <strong className="text-dark-200">{user.name}</strong></p>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Select label="Role Pengguna" value={roleName} onChange={(e) => setRoleName(e.target.value)} options={ROLE_OPTIONS} />
          <Input label="ID Unit Usaha (Opsional)" placeholder="Contoh: 1" value={unitUsahaId} onChange={(e) => setUnitUsahaId(e.target.value)} helper="Kosongkan jika akses mencakup seluruh unit usaha" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Terapkan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
