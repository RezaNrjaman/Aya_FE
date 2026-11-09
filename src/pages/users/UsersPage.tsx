/** M1-003/008: User management with role & scope assignment */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Shield, UserCheck, UserX } from 'lucide-react'
import { PageHeader, Button, Input, DataTable, StatusBadge, Pagination, ConfirmDialog, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchUsers, createUser, deactivateUser, assignUserRole, updateUser } from '@/features/m1/api'
import { PERM_ROLES_MANAGE, errorMessage, useRoleOptions, useUnitOptions } from '@/features/m1/access'
import type { User, CreateUserData, AssignRoleData } from '@/features/m1/types'
import { UserFormModal } from './UserFormModal'
import { AssignRoleModal } from './AssignRoleModal'

function useUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchUsers({ page, per_page: 10, search })
      setUsers(res.data)
      setTotalPages(res.meta?.total_pages || 1)
    } catch (e) {
      toast('error', errorMessage(e, 'Gagal memuat data pengguna'))
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => { void loadData() }, [loadData])
  return { users, loading, search, setSearch, page, setPage, totalPages, loadData }
}

interface RowActions { onRole: (u: User) => void; onDeactivate: (u: User) => void; onReactivate: (u: User) => void }

function UserActionButtons({ u, isSelf, a }: { u: User; isSelf: boolean; a: RowActions }) {
  if (isSelf) return <span className="text-xs text-dark-500">Akun Anda</span>
  return (
    <div className="flex justify-end gap-2">
      <PermissionGate permission={PERM_ROLES_MANAGE}>
        <Button size="sm" variant="secondary" onClick={() => a.onRole(u)} title="Tetapkan role & scope" aria-label={`Tetapkan role ${u.name}`}><Shield size={14} /></Button>
      </PermissionGate>
      {u.is_active ? (
        <PermissionGate permission="m1.users.delete">
          <Button size="sm" variant="danger" onClick={() => a.onDeactivate(u)} title="Nonaktifkan" aria-label={`Nonaktifkan ${u.name}`}><UserX size={14} /></Button>
        </PermissionGate>
      ) : (
        <PermissionGate permission="m1.users.update">
          <Button size="sm" variant="secondary" onClick={() => a.onReactivate(u)} title="Aktifkan kembali" aria-label={`Aktifkan ${u.name}`}><UserCheck size={14} /></Button>
        </PermissionGate>
      )}
    </div>
  )
}

function useUserColumns(a: RowActions) {
  const { user: me } = useAuth()
  const roles = useRoleOptions()
  const units = useUnitOptions()
  return [
    { key: 'name', header: 'Pengguna', render: (u: User) => <div><p className="font-medium text-dark-100">{u.name}</p><p className="text-xs text-dark-400">{u.email}</p></div> },
    { key: 'role', header: 'Role', render: (u: User) => u.role ? <StatusBadge label={roles.labelOf(u.role)} variant="info" /> : <StatusBadge label="Tanpa role" variant="warning" /> },
    { key: 'scope', header: 'Scope', render: (u: User) => <span className="text-xs text-dark-300">{units.labelOf(u.unit_usaha_id)}</span> },
    { key: 'status', header: 'Status', render: (u: User) => <StatusBadge label={u.is_active ? 'Aktif' : 'Nonaktif'} variant={u.is_active ? 'success' : 'danger'} /> },
    { key: 'actions', header: 'Aksi', className: 'text-right', render: (u: User) => <UserActionButtons u={u} isSelf={me?.id === u.id} a={a} /> },
  ]
}

function useUserActions(reload: () => Promise<void>) {
  const { toast } = useToast()
  const done = async (msg: string) => { toast('success', msg); await reload() }
  const handleCreate = async (data: CreateUserData) => { await createUser(data); await done('Pengguna berhasil ditambahkan') }
  const handleAssignRole = async (userId: number, data: AssignRoleData) => { await assignUserRole(userId, data); await done('Role berhasil ditetapkan dan langsung berlaku') }
  const run = async (fn: () => Promise<unknown>, ok: string, fail: string) => {
    try { await fn(); await done(ok) } catch (e) { toast('error', errorMessage(e, fail)) }
  }
  const handleDeactivate = (u: User) => run(() => deactivateUser(u.id), 'Pengguna dinonaktifkan; sesi aktifnya langsung berakhir', 'Gagal menonaktifkan pengguna')
  const handleReactivate = (u: User) => run(() => updateUser(u.id, { is_active: true }), 'Pengguna diaktifkan kembali', 'Gagal mengaktifkan pengguna')
  return { handleCreate, handleAssignRole, handleDeactivate, handleReactivate }
}

export function UsersPage() {
  const { users, loading, search, setSearch, page, setPage, totalPages, loadData } = useUsers()
  const actions = useUserActions(loadData)
  const [formOpen, setFormOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<User | null>(null)
  const [confirmUser, setConfirmUser] = useState<User | null>(null)
  const columns = useUserColumns({ onRole: setRoleUser, onDeactivate: setConfirmUser, onReactivate: (u) => void actions.handleReactivate(u) })

  return (
    <div className="space-y-4">
      <PageHeader title="Manajemen Pengguna" description="Kelola akun, role, scope unit usaha, dan status pengguna"
        actions={<PermissionGate permission="m1.users.create"><Button onClick={() => setFormOpen(true)}><Plus size={16} /> Tambah Pengguna</Button></PermissionGate>} />
      <div className="max-w-xs"><Input placeholder="Cari nama atau email..." aria-label="Cari pengguna" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={users} keyExtractor={(u) => String(u.id)} loading={loading} emptyMessage="Belum ada pengguna terdaftar." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {formOpen && <UserFormModal open onClose={() => setFormOpen(false)} onSubmit={actions.handleCreate} />}
      {roleUser && <AssignRoleModal user={roleUser} onClose={() => setRoleUser(null)} onSubmit={actions.handleAssignRole} />}
      <ConfirmDialog open={confirmUser !== null} title="Nonaktifkan Pengguna" confirmLabel="Nonaktifkan" confirmVariant="danger"
        message={`${confirmUser?.name ?? 'Pengguna'} tidak akan bisa login dan sesi yang sedang aktif langsung berakhir. Lanjutkan?`}
        onConfirm={async () => { if (confirmUser) await actions.handleDeactivate(confirmUser); setConfirmUser(null) }}
        onCancel={() => setConfirmUser(null)} />
    </div>
  )
}
