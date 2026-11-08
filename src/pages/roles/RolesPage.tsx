import { useState, useEffect, useCallback } from 'react'
import { Plus, ShieldCheck, X } from 'lucide-react'
import { PageHeader, Button, StatusBadge, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import {
  fetchRoles,
  createRole,
  assignRolePermission,
  revokeRolePermission,
} from '@/features/m1/api'
import type { Role, CreateRoleData } from '@/features/m1/types'
import { RoleFormModal } from './RoleFormModal'
import { AddPermissionModal } from './AddPermissionModal'

function useRoles() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchRoles()
      setRoles(data)
    } catch {
      toast('error', 'Gagal memuat data role')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadData() }, [loadData])
  return { roles, loading, loadData }
}

function RoleCardHeader({ role }: { role: Role }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-semibold text-dark-100">{role.display_name}</h3>
          <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-mono">
            {role.name}
          </span>
        </div>
        {role.description && <p className="text-xs text-dark-400 mt-1">{role.description}</p>}
      </div>
      <StatusBadge label={role.is_active ? 'Aktif' : 'Nonaktif'} variant={role.is_active ? 'success' : 'neutral'} />
    </div>
  )
}

function RolePermissionPill({ perm, onRevoke }: { perm: string; onRevoke: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white/5 border border-white/10 text-dark-300 font-mono">
      <ShieldCheck size={12} className="text-brand-400" />
      {perm}
      <PermissionGate permission="m1.roles.manage">
        <button onClick={onRevoke} className="text-dark-500 hover:text-danger ml-0.5" title="Cabut">
          <X size={12} />
        </button>
      </PermissionGate>
    </span>
  )
}

function RoleCard({ role, onAdd, onRevoke }: { role: Role; onAdd: () => void; onRevoke: (k: string) => void }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <RoleCardHeader role={role} />
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Hak Akses ({role.permissions?.length ?? 0})</p>
          <PermissionGate permission="m1.roles.manage">
            <button onClick={onAdd} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
              <Plus size={12} /> Tambah
            </button>
          </PermissionGate>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {(!role.permissions || role.permissions.length === 0) && <span className="text-xs text-dark-500 italic">Belum ada permission.</span>}
          {role.permissions?.map((p) => <RolePermissionPill key={p} perm={p} onRevoke={() => onRevoke(p)} />)}
        </div>
      </div>
    </div>
  )
}

function useRoleActions(reload: () => void) {
  const { toast } = useToast()
  const handleCreate = async (data: CreateRoleData) => {
    await createRole(data)
    toast('success', 'Role berhasil dibuat')
    reload()
  }
  const handleAssign = async (roleName: string, key: string) => {
    await assignRolePermission(roleName, key)
    toast('success', 'Permission berhasil dipetakan')
    reload()
  }
  const handleRevoke = async (roleName: string, key: string) => {
    try {
      await revokeRolePermission(roleName, key)
      toast('success', 'Permission berhasil dicabut')
      reload()
    } catch {
      toast('error', 'Gagal mencabut permission')
    }
  }
  return { handleCreate, handleAssign, handleRevoke }
}

function RoleGrid({ roles, onAdd, onRevoke }: { roles: Role[]; onAdd: (r: Role) => void; onRevoke: (name: string, key: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((r) => (
        <RoleCard key={r.name} role={r} onAdd={() => onAdd(r)} onRevoke={(k) => onRevoke(r.name, k)} />
      ))}
    </div>
  )
}

export function RolesPage() {
  const { roles, loading, loadData } = useRoles()
  const { handleCreate, handleAssign, handleRevoke } = useRoleActions(loadData)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Role & Hak Akses"
        description="Konfigurasi dynamic role dan hak akses fitur sistem"
        actions={<PermissionGate permission="m1.roles.manage"><Button onClick={() => setFormOpen(true)}><Plus size={16} /> Buat Role Baru</Button></PermissionGate>}
      />
      {loading && <div className="text-center py-8 text-dark-400">Memuat role...</div>}
      <RoleGrid roles={roles} onAdd={setSelectedRole} onRevoke={handleRevoke} />
      <RoleFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <AddPermissionModal role={selectedRole} onClose={() => setSelectedRole(null)} onSubmit={handleAssign} />
    </div>
  )
}
