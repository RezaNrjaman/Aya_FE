/** M1-005/006/007: Role management & permission configuration */
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Info, Lock, Pencil, Plus, Power, SlidersHorizontal } from 'lucide-react'
import { PageHeader, Button, StatusBadge, ConfirmDialog, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchRoles, createRole, updateRole, setRolePermissions, fetchAvailablePermissions, type PermissionDefinition } from '@/features/m1/api'
import { PERM_ROLES_MANAGE, PROTECTED_ROLE, errorMessage, moduleLabel } from '@/features/m1/access'
import type { Role } from '@/features/m1/types'
import { RoleFormModal, type RoleFormSubmit } from './RoleFormModal'
import { PermissionMatrixModal } from './PermissionMatrixModal'

function useRolesData() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [catalog, setCatalog] = useState<PermissionDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const loadData = useCallback(async () => {
    try {
      const [r, c] = await Promise.all([fetchRoles(), fetchAvailablePermissions()])
      setRoles(r); setCatalog(c.filter((p) => p.is_active))
    } catch (e) {
      toast('error', errorMessage(e, 'Gagal memuat data role'))
    } finally {
      setLoading(false)
    }
  }, [toast])
  useEffect(() => { void loadData() }, [loadData])
  return { roles, catalog, loading, loadData }
}

function moduleSummary(role: Role, catalog: PermissionDefinition[]) {
  const modules = [...new Set(catalog.map((p) => p.module))].sort()
  const owned = new Set((role.permissions ?? []).map((p) => p.key))
  return modules.map((m) => {
    const keys = catalog.filter((p) => p.module === m).map((p) => p.key)
    return { module: m, total: keys.length, granted: keys.filter((k) => owned.has(k)).length }
  })
}

function ModuleChips({ role, catalog }: { role: Role; catalog: PermissionDefinition[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {moduleSummary(role, catalog).map(({ module, total, granted }) => (
        <span key={module} title={moduleLabel(module)}
          className={`text-[11px] px-2 py-0.5 rounded border font-medium ${granted === 0 ? 'border-glass-border text-dark-500' : granted === total ? 'border-success/30 bg-success/10 text-success' : 'border-brand-500/30 bg-brand-500/10 text-brand-300'}`}>
          {module.toUpperCase()} {granted}/{total}
        </span>
      ))}
    </div>
  )
}

function PermissionList({ role }: { role: Role }) {
  const perms = role.permissions ?? []
  if (perms.length === 0) return <p className="text-xs text-dark-500 italic">Belum ada hak akses. Pengguna dengan role ini tidak dapat membuka menu apa pun.</p>
  const byModule = new Map<string, typeof perms>()
  perms.forEach((p) => byModule.set(p.module, [...(byModule.get(p.module) ?? []), p]))
  return (
    <div className="space-y-2">
      {[...byModule.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([m, list]) => (
        <div key={m}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-500">{moduleLabel(m)}</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {list.map((p) => <li key={p.key} title={p.key} className="text-xs text-dark-300 bg-white/5 border border-glass-border rounded px-2 py-0.5">{p.name || p.key}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}

function RoleCardHeader({ role, isOwn }: { role: Role; isOwn: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-semibold text-dark-100">{role.display_name}</h3>
          <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-mono">{role.name}</span>
          {(role.is_system || role.name === PROTECTED_ROLE) && <span className="text-[11px] text-warning flex items-center gap-1"><Lock size={11} /> Role sistem</span>}
          {role.division_id && <span className="text-[11px] text-dark-400">· {role.unit_name || 'Unit'} / {role.category_name || 'Kategori'} / {role.division_name || `Divisi #${role.division_id}`}</span>}
          {isOwn && <span className="text-[11px] text-dark-400">· role Anda</span>}
        </div>
        {role.description && <p className="text-xs text-dark-400 mt-1">{role.description}</p>}
      </div>
      <StatusBadge label={role.is_active ? 'Aktif' : 'Nonaktif'} variant={role.is_active ? 'success' : 'neutral'} />
    </div>
  )
}

interface CardActions { onMatrix: () => void; onEdit: () => void; onToggle: () => void }

function RoleCardActions({ role, isOwn, a }: { role: Role; isOwn: boolean; a: CardActions }) {
  const canToggle = role.name !== PROTECTED_ROLE && !(isOwn && role.is_active)
  if (role.is_system) return null
  return (
    <PermissionGate permission={PERM_ROLES_MANAGE}>
      <div className="flex flex-wrap gap-2 pt-3 border-t border-glass-border">
        <Button size="sm" onClick={a.onMatrix}><SlidersHorizontal size={14} /> Atur Hak Akses</Button>
        <Button size="sm" variant="secondary" onClick={a.onEdit}><Pencil size={14} /> Ubah</Button>
        {canToggle && (
          <Button size="sm" variant={role.is_active ? 'danger' : 'secondary'} onClick={a.onToggle}>
            <Power size={14} /> {role.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        )}
      </div>
    </PermissionGate>
  )
}

function RoleCard({ role, catalog, a }: { role: Role; catalog: PermissionDefinition[]; a: CardActions }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const isOwn = user?.role === role.name
  return (
    <div className={`glass-card p-5 space-y-3 ${role.is_active ? '' : 'opacity-75'}`}>
      <RoleCardHeader role={role} isOwn={isOwn} />
      <ModuleChips role={role} catalog={catalog} />
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {role.permissions?.length ?? 0} hak akses
      </button>
      {open && <PermissionList role={role} />}
      <RoleCardActions role={role} isOwn={isOwn} a={a} />
    </div>
  )
}

function useRoleActions(reload: () => Promise<void>) {
  const { toast } = useToast()
  const { refreshProfile } = useAuth()
  const afterChange = async (msg: string) => { toast('success', msg); await Promise.all([reload(), refreshProfile()]) }
  const submitForm = async (d: RoleFormSubmit) => {
    if (d.create) { await createRole(d.create); return afterChange('Role berhasil dibuat') }
    if (d.update) { await updateRole(d.update.name, d.update.data); return afterChange('Role berhasil diperbarui') }
  }
  const saveMatrix = async (name: string, keys: string[]) => {
    await setRolePermissions(name, keys)
    await afterChange('Hak akses role berhasil disimpan dan langsung berlaku')
  }
  const toggleActive = async (role: Role) => {
    try { await updateRole(role.name, { is_active: !role.is_active }); await afterChange(role.is_active ? 'Role dinonaktifkan' : 'Role diaktifkan') }
    catch (e) { toast('error', errorMessage(e, 'Gagal mengubah status role')) }
  }
  return { submitForm, saveMatrix, toggleActive }
}

function AccessInfo() {
  return (
    <div className="glass-card p-3 flex gap-2 text-xs text-dark-300">
      <Info size={16} className="text-brand-400 shrink-0" />
      <p>Perubahan hak akses berlaku langsung untuk semua pengguna dengan role tersebut, tanpa perlu login ulang. Role nonaktif tidak memberi hak akses apa pun dan tidak bisa ditetapkan ke pengguna.</p>
    </div>
  )
}

function useRoleDialogs() {
  const [form, setForm] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null })
  const [matrixRole, setMatrixRole] = useState<Role | null>(null)
  const [toggleRole, setToggleRole] = useState<Role | null>(null)
  return { form, setForm, matrixRole, setMatrixRole, toggleRole, setToggleRole }
}

export function RolesPage() {
  const { roles, catalog, loading, loadData } = useRolesData()
  const actions = useRoleActions(loadData)
  const d = useRoleDialogs()
  const cardActions = (r: Role): CardActions => ({ onMatrix: () => d.setMatrixRole(r), onEdit: () => d.setForm({ open: true, role: r }), onToggle: () => d.setToggleRole(r) })

  return (
    <div className="space-y-6">
      <PageHeader title="Manajemen Role & Hak Akses" description="Setiap role wajib berada pada satu divisi. Hak akses ditentukan untuk role di divisi tersebut."
        actions={<PermissionGate permission={PERM_ROLES_MANAGE}><Button onClick={() => d.setForm({ open: true, role: null })}><Plus size={16} /> Buat Role Baru</Button></PermissionGate>} />
      <AccessInfo />
      {loading && <div className="text-center py-8 text-dark-400">Memuat role...</div>}
      {!loading && roles.length === 0 && <div className="text-center py-8 text-dark-400">Belum ada role.</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map((r) => <RoleCard key={r.name} role={r} catalog={catalog} a={cardActions(r)} />)}
      </div>
      {d.form.open && <RoleFormModal open role={d.form.role} catalog={catalog} onClose={() => d.setForm({ open: false, role: null })} onSubmit={actions.submitForm} />}
      {d.matrixRole && <PermissionMatrixModal role={d.matrixRole} onClose={() => d.setMatrixRole(null)} onSave={actions.saveMatrix} />}
      <ConfirmDialog open={d.toggleRole !== null} title={d.toggleRole?.is_active ? 'Nonaktifkan Role' : 'Aktifkan Role'}
        message={d.toggleRole?.is_active ? `Pengguna dengan role "${d.toggleRole?.display_name}" akan langsung kehilangan seluruh hak aksesnya. Lanjutkan?` : `Hak akses role "${d.toggleRole?.display_name}" akan kembali berlaku. Lanjutkan?`}
        confirmLabel={d.toggleRole?.is_active ? 'Nonaktifkan' : 'Aktifkan'} confirmVariant={d.toggleRole?.is_active ? 'danger' : 'primary'}
        onConfirm={async () => { if (d.toggleRole) await actions.toggleActive(d.toggleRole); d.setToggleRole(null) }} onCancel={() => d.setToggleRole(null)} />
    </div>
  )
}
