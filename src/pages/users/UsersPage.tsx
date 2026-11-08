import { useState, useEffect, useCallback } from 'react'
import { Plus, Shield, UserX } from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  DataTable,
  StatusBadge,
  Pagination,
  ConfirmDialog,
  useToast,
} from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchUsers, createUser, deactivateUser, assignUserRole } from '@/features/m1/api'
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
      setTotalPages(res.meta?.total_pages ?? 1)
    } catch {
      toast('error', 'Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { users, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function UserActionButtons({ u, onRole, onDeactivate }: { u: User; onRole: (u: User) => void; onDeactivate: (id: number) => void }) {
  return (
    <div className="flex justify-end gap-2">
      <PermissionGate permission="m1.roles.manage">
        <Button size="sm" variant="secondary" onClick={() => onRole(u)} title="Tetapkan Role"><Shield size={14} /></Button>
      </PermissionGate>
      {u.is_active && (
        <PermissionGate permission="m1.users.delete">
          <Button size="sm" variant="danger" onClick={() => onDeactivate(u.id)} title="Nonaktifkan"><UserX size={14} /></Button>
        </PermissionGate>
      )}
    </div>
  )
}

function getUserColumns(onRole: (u: User) => void, onDeactivate: (id: number) => void) {
  const infoCols = [
    { key: 'name', header: 'Pengguna', render: (u: User) => <div><p className="font-medium text-dark-100">{u.name}</p><p className="text-xs text-dark-400">{u.email}</p></div> },
    { key: 'role', header: 'Role', render: (u: User) => <StatusBadge label={u.role.toUpperCase()} variant="info" /> },
    { key: 'status', header: 'Status', render: (u: User) => <StatusBadge label={u.is_active ? 'Aktif' : 'Nonaktif'} variant={u.is_active ? 'success' : 'danger'} /> },
  ]
  const actionCol = { key: 'actions', header: 'Aksi', className: 'text-right', render: (u: User) => <UserActionButtons u={u} onRole={onRole} onDeactivate={onDeactivate} /> }
  return [...infoCols, actionCol]
}

function useUserActions(reload: () => void) {
  const { toast } = useToast()
  const handleCreate = async (data: CreateUserData) => {
    await createUser(data); toast('success', 'Pengguna berhasil ditambahkan'); reload()
  }
  const handleDeactivate = async (id: number | null) => {
    if (!id) return
    try { await deactivateUser(id); toast('success', 'Pengguna dinonaktifkan'); reload() }
    catch { toast('error', 'Gagal menonaktifkan pengguna') }
  }
  const handleAssignRole = async (userId: number, data: AssignRoleData) => {
    await assignUserRole(userId, data); toast('success', 'Role berhasil ditetapkan'); reload()
  }
  return { handleCreate, handleDeactivate, handleAssignRole }
}

interface UserModalsProps {
  formOpen: boolean; setFormOpen: (v: boolean) => void; handleCreate: (d: CreateUserData) => Promise<void>
  roleUser: User | null; setRoleUser: (u: User | null) => void; handleAssignRole: (id: number, d: AssignRoleData) => Promise<void>
  deactivateId: number | null; setDeactivateId: (id: number | null) => void; handleDeactivate: (id: number | null) => Promise<void>
}

function UserModals({ formOpen, setFormOpen, handleCreate, roleUser, setRoleUser, handleAssignRole, deactivateId, setDeactivateId, handleDeactivate }: UserModalsProps) {
  return (
    <>
      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <AssignRoleModal user={roleUser} onClose={() => setRoleUser(null)} onSubmit={handleAssignRole} />
      <ConfirmDialog
        open={deactivateId !== null}
        title="Nonaktifkan Pengguna"
        message="Apakah Anda yakin ingin menonaktifkan pengguna ini?"
        confirmLabel="Nonaktifkan"
        confirmVariant="danger"
        onConfirm={async () => { await handleDeactivate(deactivateId); setDeactivateId(null) }}
        onCancel={() => setDeactivateId(null)}
      />
    </>
  )
}

export function UsersPage() {
  const { users, loading, search, setSearch, page, setPage, totalPages, loadData } = useUsers()
  const { handleCreate, handleDeactivate, handleAssignRole } = useUserActions(loadData)
  const [formOpen, setFormOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<User | null>(null)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)
  const columns = getUserColumns(setRoleUser, setDeactivateId)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun, hak akses, dan status operasional sistem"
        actions={<PermissionGate permission="m1.users.create"><Button onClick={() => setFormOpen(true)}><Plus size={16} /> Tambah Pengguna</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari nama atau email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={users} keyExtractor={(u) => String(u.id)} loading={loading} emptyMessage="Belum ada pengguna terdaftar." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <UserModals formOpen={formOpen} setFormOpen={setFormOpen} handleCreate={handleCreate} roleUser={roleUser} setRoleUser={setRoleUser} handleAssignRole={handleAssignRole} deactivateId={deactivateId} setDeactivateId={setDeactivateId} handleDeactivate={handleDeactivate} />
    </div>
  )
}
