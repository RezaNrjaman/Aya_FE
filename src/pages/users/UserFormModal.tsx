/** M1-003: Create user — role & scope selectable only with m1.roles.manage */
import { useState, type FormEvent } from 'react'
import { Button, Input, Select } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { PERM_ROLES_MANAGE, errorMessage, useRoleOptions, useUnitOptions } from '@/features/m1/access'
import type { CreateUserData } from '@/features/m1/types'

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', role: '', unit: '' }

function toPayload(form: typeof EMPTY_FORM, canManageRoles: boolean): CreateUserData {
  const base: CreateUserData = { name: form.name, email: form.email, password: form.password, phone: form.phone }
  if (!canManageRoles) return base
  return { ...base, role: form.role || undefined, unit_usaha_id: form.unit ? Number(form.unit) : undefined }
}

function useUserForm(canManageRoles: boolean, onSubmit: (data: CreateUserData) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await onSubmit(toPayload(form, canManageRoles)); onClose() }
    catch (err) { setError(errorMessage(err, 'Gagal menyimpan pengguna')) }
    finally { setLoading(false) }
  }
  return { form, setForm, loading, error, submit }
}

function AccessFields({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const roles = useRoleOptions()
  const units = useUnitOptions()
  return (
    <>
      <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={roles.options} placeholder="Pilih role" required />
      <Select label="Scope Unit Usaha" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={units.options} />
    </>
  )
}

export function UserFormModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: CreateUserData) => Promise<void> }) {
  const { hasPermission } = useAuth()
  const canManageRoles = hasPermission(PERM_ROLES_MANAGE)
  const { form, setForm, loading, error, submit } = useUserForm(canManageRoles, onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
      <div className="glass-card w-full max-w-md p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <h3 id="user-form-title" className="font-heading text-lg font-semibold text-dark-100">Tambah Pengguna Baru</h3>
        {error && <div role="alert" className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password Awal" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required helper="Minimal 8 karakter" />
          <Input label="Nomor Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {canManageRoles
            ? <AccessFields form={form} setForm={setForm} />
            : <p className="text-xs text-dark-400 bg-white/5 border border-glass-border rounded p-2">Role dan hak akses akun ini ditetapkan oleh pengelola hak akses.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
