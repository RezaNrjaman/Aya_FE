/** ARY-006: partner-owned division management page */
import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
  SearchableSelect,
  useToast,
} from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchAllTenantUnits, fetchAllCategories } from '@/features/m2/api'
import type { BusinessUnit, BusinessCategory } from '@/features/m2/types'
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
  unit_usaha_id: number
  category_id: number
}

function DivisionFormModal({
  open, initial, onClose, onSubmit,
}: {
  open: boolean
  initial: Division | null
  onClose: () => void
  onSubmit: (d: DivisionFormState) => Promise<void>
}) {
  const [form, setForm] = useState<DivisionFormState>({ name: '', description: '', unit_usaha_id: 0, category_id: 0 })
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (!open) return
    fetchAllTenantUnits().then(setUnits).catch(() => setUnits([]))
    setForm({ name: initial?.name ?? '', description: initial?.description ?? '', unit_usaha_id: initial?.unit_usaha_id ?? 0, category_id: initial?.category_id ?? 0 })
  }, [open, initial])
  useEffect(() => {
    if (!open || !form.unit_usaha_id) { setCategories([]); return }
    let alive = true
    fetchAllCategories(form.unit_usaha_id)
      .then(res => { if (alive) setCategories(res.filter(c => c.is_active)) })
      .catch(() => { if (alive) setCategories([]) })
    return () => { alive = false }
  }, [open, form.unit_usaha_id])
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, saving, onClose])
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.unit_usaha_id || !form.category_id) return
    setSaving(true)
    try { await onSubmit(form); onClose() } finally { setSaving(false) }
  }
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !saving) onClose() }}>
    <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
      <h3 className="font-heading text-lg font-semibold text-dark-100">{initial ? 'Edit Divisi' : 'Tambah Divisi Baru'}</h3>
      <form onSubmit={submit} className="space-y-3">
        <SearchableSelect label="Unit Usaha" value={form.unit_usaha_id ? String(form.unit_usaha_id) : ''} onChange={value => setForm({ ...form, unit_usaha_id: Number(value), category_id: 0 })} required
          options={units.filter(u => u.is_active).map(u => ({ value: String(u.id), label: u.name }))} placeholder="Pilih unit usaha" />
        <SearchableSelect label="Kategori" value={form.category_id ? String(form.category_id) : ''} onChange={value => setForm({ ...form, category_id: Number(value) })} required disabled={!form.unit_usaha_id}
          options={categories.map(c => ({ value: String(c.id), label: c.name }))} placeholder={form.unit_usaha_id ? 'Pilih kategori' : 'Pilih unit usaha terlebih dahulu'} />
        <Input label="Nama Divisi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Textarea label="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2"><Button variant="tertiary" type="button" onClick={onClose} disabled={saving}>Batal</Button><Button type="submit" loading={saving} disabled={!form.unit_usaha_id || !form.category_id}>Simpan Divisi</Button></div>
      </form>
    </div>
  </div>
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
      setDivisions(Array.isArray(res?.data) ? res.data : [])
      setTotalPages(res?.meta?.total_pages ?? 1)
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
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal menyimpan divisi (nama mungkin sudah dipakai)')
      throw error
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
      key: 'hierarchy', header: 'Unit / Kategori',
      render: (d: Division) => <div><p className="text-xs text-dark-200">{d.unit_name || `Unit #${d.unit_usaha_id}`}</p><p className="text-xs text-dark-400">{d.category_name || `Kategori #${d.category_id}`}</p></div>,
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
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/dashboard" className="inline-flex items-center rounded-lg px-3 py-2 text-sm text-dark-300 hover:text-dark-100 hover:bg-white/5">
              Kembali ke Dashboard
            </Link>
            <PermissionGate permission="m2.divisions.manage">
              <Button onClick={() => { setSelected(null); setModalOpen(true) }}><Plus size={16} /> Tambah Divisi</Button>
            </PermissionGate>
          </div>
        }
      />
      {!loading && (Array.isArray(divisions) ? divisions.length : 0) === 0 && (
        <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-dark-100">Divisi belum dibuat</p>
            <p className="text-xs text-dark-400">Divisi harus dibuat di dalam kategori yang berada pada unit usaha tertentu.</p>
          </div>
          <Link to="/dashboard" className="text-sm text-brand-400 hover:underline whitespace-nowrap">Lewati untuk sekarang</Link>
        </div>
      )}
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
