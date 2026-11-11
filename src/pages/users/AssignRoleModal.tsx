/** M1-008: Assign a role and business-unit scope to a user */
import { useState, type FormEvent } from 'react'
import { Button, Select } from '@/components/ui'
import { errorMessage, useRoleOptions, useUnitOptions } from '@/features/m1/access'
import type { User, AssignRoleData } from '@/features/m1/types'

function useAssignRole(user: User, onSubmit: (id: number, d: AssignRoleData) => Promise<void>, onClose: () => void) {
  const [roleName, setRoleName] = useState(user.role ?? '')
  const [unitUsahaId, setUnitUsahaId] = useState(user.unit_usaha_id ? String(user.unit_usaha_id) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!roleName) { setError('Pilih role terlebih dahulu'); return }
    setError(''); setLoading(true)
    try {
      await onSubmit(user.id, { role_name: roleName, unit_usaha_id: unitUsahaId ? Number(unitUsahaId) : undefined })
      onClose()
    } catch (err) {
      setError(errorMessage(err, 'Gagal menetapkan role'))
    } finally {
      setLoading(false)
    }
  }
  return { roleName, setRoleName, unitUsahaId, setUnitUsahaId, loading, error, submit }
}

function RoleSummary({ roleName, roles }: { roleName: string; roles: ReturnType<typeof useRoleOptions>['roles'] }) {
  const role = roles.find((r) => r.name === roleName)
  if (!role) return null
  return (
    <p className="text-xs text-dark-400 bg-white/5 border border-glass-border rounded p-2">
      {role.description || role.display_name} · <strong className="text-dark-200">{role.permissions?.length ?? 0} hak akses</strong>
    </p>
  )
}

export function AssignRoleModal({ user, onClose, onSubmit }: { user: User; onClose: () => void; onSubmit: (id: number, d: AssignRoleData) => Promise<void> }) {
  const { roleName, setRoleName, unitUsahaId, setUnitUsahaId, loading, error, submit } = useAssignRole(user, onSubmit, onClose)
  const { roles, labelOf } = useRoleOptions()
  const options = roles.filter(r => r.is_active && r.division_id === user.division_id)
    .map(r => ({ value: r.name, label: r.display_name }))
  const units = useUnitOptions()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="assign-role-title">
      <div className="glass-card w-full max-w-md p-6 space-y-4">
        <div>
          <h3 id="assign-role-title" className="font-heading text-lg font-semibold text-dark-100">Tetapkan Role & Scope</h3>
          <p className="text-xs text-dark-400">Pengguna: <strong className="text-dark-200">{user.name}</strong> · role saat ini: <strong className="text-dark-200">{user.role ? labelOf(user.role) : 'belum ada'}</strong></p>
        </div>
        {error && <div role="alert" className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-dark-400">Divisi pengguna: {user.division_name || `#${user.division_id ?? 'belum ditentukan'}`}. Role hanya dapat dipilih dari divisi yang sama.</p>
          <Select label="Role Pengguna" value={roleName} onChange={(e) => setRoleName(e.target.value)} options={options} placeholder="Pilih role pada divisi pengguna" required />
          <RoleSummary roleName={roleName} roles={roles} />
          <Select label="Unit Usaha" value={unitUsahaId} onChange={(e) => setUnitUsahaId(e.target.value)} options={units.options.filter(o => o.value === String(user.unit_usaha_id ?? ''))} disabled />
          <p className="text-xs text-dark-500">Perubahan langsung berlaku pada sesi pengguna yang sedang aktif.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Terapkan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
