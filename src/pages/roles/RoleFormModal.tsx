/** M1-005: Create or edit a dynamic role */
import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { errorMessage } from '@/features/m1/access'
import type { CreateRoleData, Role, UpdateRoleData } from '@/features/m1/types'

const ROLE_CODE_PATTERN = /^[a-z][a-z0-9_]{2,49}$/

export interface RoleFormSubmit {
  create?: CreateRoleData
  update?: { name: string; data: UpdateRoleData }
}

function initialForm(role: Role | null): CreateRoleData & { copyFrom: string } {
  return { name: role?.name ?? '', display_name: role?.display_name ?? '', description: role?.description ?? '', copyFrom: '' }
}

function buildSubmit(role: Role | null, form: ReturnType<typeof initialForm>, roles: Role[]): RoleFormSubmit {
  if (role) return { update: { name: role.name, data: { display_name: form.display_name, description: form.description } } }
  const source = roles.find((r) => r.name === form.copyFrom)
  const permission_keys = source?.permissions?.map((p) => p.key) ?? []
  return { create: { name: form.name, display_name: form.display_name, description: form.description, permission_keys } }
}

function useRoleForm(role: Role | null, roles: Role[], onSubmit: (d: RoleFormSubmit) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState(() => initialForm(role))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const codeInvalid = !role && form.name !== '' && !ROLE_CODE_PATTERN.test(form.name)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (codeInvalid) return
    setError(''); setLoading(true)
    try { await onSubmit(buildSubmit(role, form, roles)); onClose() }
    catch (err) { setError(errorMessage(err, 'Gagal menyimpan role')) }
    finally { setLoading(false) }
  }
  return { form, setForm, loading, error, submit, codeInvalid }
}

interface Props {
  open: boolean
  role: Role | null
  roles: Role[]
  onClose: () => void
  onSubmit: (d: RoleFormSubmit) => Promise<void>
}

export function RoleFormModal({ open, role, roles, onClose, onSubmit }: Props) {
  const { form, setForm, loading, error, submit, codeInvalid } = useRoleForm(role, roles, onSubmit, onClose)
  if (!open) return null
  const copyOptions = roles.map((r) => ({ value: r.name, label: `${r.display_name} (${r.permissions?.length ?? 0} hak akses)` }))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="role-form-title">
      <div className="glass-card w-full max-w-md p-6 space-y-4">
        <h3 id="role-form-title" className="font-heading text-lg font-semibold text-dark-100">{role ? 'Ubah Role' : 'Buat Role Baru'}</h3>
        {error && <div role="alert" className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Kode Role" placeholder="contoh: supervisor" value={form.name} disabled={!!role} required
            onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            error={codeInvalid ? 'Huruf kecil, angka, atau _ (3–50 karakter, diawali huruf)' : undefined}
            helper={role ? 'Kode role tidak dapat diubah.' : 'Dipakai sistem sebagai identitas role.'} />
          <Input label="Nama Tampilan" placeholder="contoh: Supervisor Lapangan" value={form.display_name} required onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          <Textarea label="Deskripsi" placeholder="Tanggung jawab role ini..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {!role && <Select label="Salin hak akses dari (opsional)" value={form.copyFrom} onChange={(e) => setForm({ ...form, copyFrom: e.target.value })} placeholder="Mulai tanpa hak akses" options={copyOptions} />}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading} disabled={codeInvalid}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
