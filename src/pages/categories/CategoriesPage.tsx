import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Edit2, Plus, Power } from 'lucide-react'
import { Button, DataTable, Input, PageHeader, Pagination, StatusBadge, Textarea, SearchableSelect, useToast } from '@/components/ui'
import { fetchCategories, fetchAllTenantUnits, createCategory, updateCategory, activateCategory, deactivateCategory } from '@/features/m2/api'
import type { BusinessCategory, BusinessUnit, CreateCategoryData } from '@/features/m2/types'

function CategoryModal({ open, initial, units, onClose, onSave }: {
  open: boolean; initial: BusinessCategory | null; units: BusinessUnit[]
  onClose: () => void; onSave: (data: CreateCategoryData) => Promise<void>
}) {
  const [unitID, setUnitID] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (open) {
      setUnitID(initial ? String(initial.unit_usaha_id) : '')
      setName(initial?.name ?? '')
      setDescription(initial?.description ?? '')
      setError('')
    }
  }, [open, initial])
  if (!open) return null
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await onSave({ unit_usaha_id: Number(unitID), name, description })
      onClose()
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal menyimpan kategori') }
    finally { setBusy(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="glass-card w-full max-w-lg p-6 space-y-4">
      <h3 className="font-heading text-lg font-semibold text-dark-100">{initial ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <form onSubmit={submit} className="space-y-3">
        <SearchableSelect label="Unit Usaha" value={unitID} disabled={!!initial} onChange={setUnitID} required
          options={units.filter(u => u.is_active).map(u => ({ value: String(u.id), label: u.name }))} placeholder="Pilih unit usaha" />
        <Input label="Nama Kategori" value={name} onChange={e => setName(e.target.value)} required />
        <Textarea label="Deskripsi" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex justify-end gap-2"><Button type="button" variant="tertiary" onClick={onClose} disabled={busy}>Batal</Button><Button type="submit" loading={busy} disabled={!unitID}>Simpan</Button></div>
      </form>
    </div>
  </div>
}

export function CategoriesPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<BusinessCategory[]>([])
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState<BusinessCategory | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchCategories({ page, per_page: 10, search })
      setItems(result.data); setTotalPages(result.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat kategori') }
    finally { setLoading(false) }
  }, [page, search, toast])
  useEffect(() => { void load() }, [load])
  useEffect(() => { fetchAllTenantUnits().then(setUnits).catch(() => setUnits([])) }, [])
  const save = async (data: CreateCategoryData) => {
    if (selected) await updateCategory(selected.id, { name: data.name, description: data.description })
    else await createCategory(data)
    toast('success', selected ? 'Kategori diperbarui' : 'Kategori dibuat')
    await load()
  }
  const toggle = async (item: BusinessCategory) => {
    try {
      if (item.is_active) await deactivateCategory(item.id); else await activateCategory(item.id)
      toast('success', 'Status kategori diperbarui'); await load()
    } catch { toast('error', 'Gagal mengubah status kategori') }
  }
  const columns = [
    { key: 'name', header: 'Kategori', render: (c: BusinessCategory) => <div><p className="font-medium text-dark-100">{c.name}</p><p className="text-xs text-dark-400">{c.description || '—'}</p></div> },
    { key: 'unit', header: 'Unit Usaha', render: (c: BusinessCategory) => units.find(u => u.id === c.unit_usaha_id)?.name ?? `Unit #${c.unit_usaha_id}` },
    { key: 'status', header: 'Status', render: (c: BusinessCategory) => <StatusBadge label={c.is_active ? 'Aktif' : 'Nonaktif'} variant={c.is_active ? 'success' : 'neutral'} /> },
    { key: 'actions', header: 'Aksi', render: (c: BusinessCategory) => <div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => { setSelected(c); setModal(true) }}><Edit2 size={14}/></Button><Button size="sm" variant="secondary" onClick={() => void toggle(c)}><Power size={14}/></Button></div> },
  ]
  return <div className="space-y-4">
    <PageHeader title="Kategori" description="Setiap kategori harus berada di dalam satu unit usaha."
      actions={<Button onClick={() => { setSelected(null); setModal(true) }}><Plus size={16}/> Tambah Kategori</Button>} />
    <div className="max-w-xs"><Input placeholder="Cari kategori..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/></div>
    <DataTable columns={columns} data={items} keyExtractor={c => String(c.id)} loading={loading} emptyMessage="Belum ada kategori."/>
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
    <CategoryModal open={modal} initial={selected} units={units} onClose={() => setModal(false)} onSave={save}/>
  </div>
}
