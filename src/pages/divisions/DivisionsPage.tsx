/** ARY-006: partner-owned division management page */
import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Plus, Ban, CheckCircle, Trash2, Edit2 } from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  DataTable,
  StatusBadge,
  Pagination,
  ConfirmDialog,
  Textarea,
  useToast,
} from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import {
  fetchDivisions,
  createDivision,
  updateDivision,
  deactivateDivision,
  activateDivision,
  deleteDivision,
} from '@/features/m2/api'
import type { Division } from '@/features/m2/types'

interface DivisionFormState {
  name: string
  description: string
}

function DivisionFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  initial: Division | null
  onClose: () => void
  onSubmit: (d: DivisionFormState) => Promise<void>
}) {
  const [form, setForm] = useState<DivisionFormState>({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ name: initial?.name ?? '', description: initial?.description ?? '' })
    }
  }, [open, initial])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-heading text-lg font-semibold text-dark-100">{initial ? 'Edit Divisi' : 'Tambah Divisi Baru'}</h3>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Nama Divisi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={saving}>Batal</Button>
            <Button type="submit" loading={saving}>{initial ? 'Simpan Perubahan' : 'Buat Divisi'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DivisionsPage() {
  const { toast } = useToast()
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Division | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Division | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Division | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchDivisions({ page, per_page: 10, search })
      setDivisions(res.data)
      setTotalPages(res.meta?.total_pages ?? 1)
    } catch {
      toast('error', 'Gagal memuat data divisi')
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])

  const handleSave = async (d: DivisionFormState) => {
    try {
      if (selected) { await updateDivision(selected.id, d); toast('success', 'Divisi diperbarui') }
      else { await createDivision(d); toast('success', 'Divisi berhasil dibuat') }
      loadData()
      return
    } catch {
      toast('error', 'Gagal menyimpan divisi (nama mungkin sudah dipakai)')
    }
  }

  const handleToggle = async () => {
    if (!toggleTarget) return
    try {
      if (toggleTarget.is_active) { await deactivateDivision(toggleTarget.id); toast('success', 'Divisi dinonaktifkan') }
      else { await activateDivision(toggleTarget.id); toast('success', 'Divisi diaktifkan') }
      loadData()
    } catch {
      toast('error', 'Gagal mengubah status divisi')
    }
    setToggleTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDivision(deleteTarget.id)
      toast('success', 'Divisi dihapus')
      loadData()
    } catch {
      toast('error', 'Divisi masih digunakan dan tidak dapat dihapus')
    }
    setDeleteTarget(null)
  }

  const columns = [
    {
      key: 'name', header: 'Divisi',
      render: (d: Division) => (
        <div>
          <p className="font-medium text-dark-100">{d.name}</p>
          <p className="text-xs text-dark-400">{d.description || '—'}</p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (d: Division) => <StatusBadge label={d.is_active ? 'Aktif' : 'Nonaktif'} variant={d.is_active ? 'success' : 'neutral'} />,
    },
    {
      key: 'actions', header: 'Aksi', className: 'text-right',
      render: (d: Division) => (
        <div className="flex justify-end gap-2">
          <PermissionGate permission="m2.divisions.manage">
            <Button size="sm" variant="secondary" onClick={() => { setSelected(d); setModalOpen(true) }} title="Edit"><Edit2 size={14} /></Button>
            <Button size="sm" variant={d.is_active ? 'danger' : 'secondary'} onClick={() => setToggleTarget(d)} title={d.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
              {d.is_active ? <Ban size={14} /> : <CheckCircle size={14} className="text-success" />}
            </Button>
            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(d)} title="Hapus"><Trash2 size={14} /></Button>
          </PermissionGate>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Divisi"
        description="Susun struktur organisasi divisi milik partner Anda"
        actions={
          <PermissionGate permission="m2.divisions.manage">
            <Button onClick={() => { setSelected(null); setModalOpen(true) }}><Plus size={16} /> Tambah Divisi</Button>
          </PermissionGate>
        }
      />
      <div className="max-w-xs">
        <Input placeholder="Cari divisi..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>
      <DataTable columns={columns} data={divisions} keyExtractor={(d) => String(d.id)} loading={loading} emptyMessage="Belum ada divisi terdaftar." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <DivisionFormModal open={modalOpen} initial={selected} onClose={() => setModalOpen(false)} onSubmit={handleSave} />
      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.is_active ? 'Nonaktifkan Divisi' : 'Aktifkan Divisi'}
        message={`Apakah Anda yakin ingin ${toggleTarget?.is_active ? 'menonaktifkan' : 'mengaktifkan'} ${toggleTarget?.name}?`}
        confirmLabel={toggleTarget?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        confirmVariant={toggleTarget?.is_active ? 'danger' : 'primary'}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Divisi"
        message={`Divisi ${deleteTarget?.name} akan dihapus permanen. Divisi yang masih dipakai anggota atau unit usaha tidak dapat dihapus.`}
        confirmLabel="Hapus"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
