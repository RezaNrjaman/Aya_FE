/** M1-005: Create or edit a dynamic role with explicit initial permissions. */
import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button, Input, SearchableSelect, Textarea } from '@/components/ui'
import { errorMessage, moduleLabel } from '@/features/m1/access'
import { fetchAllTenantUnits, fetchAllCategories, fetchAllDivisions } from '@/features/m2/api'
import type { BusinessUnit, BusinessCategory, Division } from '@/features/m2/types'
import type { CreateRoleData, Role, UpdateRoleData } from '@/features/m1/types'
import type { PermissionDefinition } from '@/features/m1/api'

const ROLE_CODE_PATTERN = /^[a-z][a-z0-9_]{2,49}$/

export interface RoleFormSubmit {
  create?: CreateRoleData
  update?: { name: string; data: UpdateRoleData }
}

function initialForm(role: Role | null): CreateRoleData {
  return { name: role?.name ?? '', display_name: role?.display_name ?? '', description: role?.description ?? '', division_id: role?.division_id ?? 0, permission_keys: [] }
}

function buildSubmit(role: Role | null, form: CreateRoleData, permissionKeys: string[]): RoleFormSubmit {
  if (role) return { update: { name: role.name, data: { display_name: form.display_name, description: form.description } } }
  return { create: { name: form.name, display_name: form.display_name, description: form.description, division_id: form.division_id, permission_keys: [...permissionKeys] } }
}

function useRoleForm(role: Role | null, onSubmit: (d: RoleFormSubmit) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState<CreateRoleData>(() => initialForm(role))
  const [permissionKeys, setPermissionKeys] = useState<string[]>([])
  const [permissionSearch, setPermissionSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const codeInvalid = !role && form.name !== '' && !ROLE_CODE_PATTERN.test(form.name)
  const divisionInvalid = !role && !form.division_id
  const permissionsInvalid = !role && permissionKeys.length === 0

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (codeInvalid || divisionInvalid || permissionsInvalid) {
      setError(permissionsInvalid ? 'Pilih minimal satu hak akses untuk role ini.' : 'Lengkapi seluruh struktur role.')
      return
    }
    setError(''); setLoading(true)
    try { await onSubmit(buildSubmit(role, form, permissionKeys)); onClose() }
    catch (err) { setError(errorMessage(err, 'Gagal menyimpan role')) }
    finally { setLoading(false) }
  }
  return { form, setForm, permissionKeys, setPermissionKeys, permissionSearch, setPermissionSearch, loading, error, submit, codeInvalid, divisionInvalid, permissionsInvalid }
}

function PermissionPicker({ catalog, selected, onChange, search, onSearch }: {
  catalog: PermissionDefinition[]; selected: string[]; onChange: (keys: string[]) => void; search: string; onSearch: (q: string) => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return catalog.filter(p => !q || [p.key, p.name, p.description, p.module].some(v => v?.toLowerCase().includes(q)))
  }, [catalog, search])
  const groups = useMemo(() => {
    const map = new Map<string, PermissionDefinition[]>()
    filtered.forEach(p => map.set(p.module, [...(map.get(p.module) ?? []), p]))
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])
  const toggle = (key: string, checked: boolean) => onChange(checked ? [...new Set([...selected, key])] : selected.filter(k => k !== key))
  return (
    <section className="space-y-2 rounded-lg border border-glass-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div><p className="text-sm font-medium text-dark-200">Hak Akses Awal <span className="text-danger">*</span></p><p className="text-[11px] text-dark-500">Pilih minimal satu hak akses untuk role ini.</p></div>
        <span className="text-xs text-brand-300">{selected.length} dipilih</span>
      </div>
      <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" /><input value={search} onChange={e => onSearch(e.target.value)} placeholder="Cari hak akses..." className="glass-input w-full pl-8 pr-3 py-2 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40" /></div>
      <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
        {catalog.length === 0 && <p className="text-xs text-warning py-3 text-center">Tidak ada hak akses yang dapat diberikan oleh akun Anda.</p>}
        {catalog.length > 0 && groups.length === 0 && <p className="text-xs text-dark-500 py-3 text-center">Tidak ada hak akses yang cocok.</p>}
        {groups.map(([module, perms]) => <div key={module} className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-dark-400">{moduleLabel(module)}</p>
          {perms.map(p => <label key={p.key} className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-white/5 cursor-pointer"><input type="checkbox" className="accent-brand-500 mt-0.5" checked={selected.includes(p.key)} onChange={e => toggle(p.key, e.target.checked)} /><span className="min-w-0"><span className="block text-xs text-dark-200">{p.name}</span><span className="block font-mono text-[10px] text-dark-500 break-all">{p.key}</span></span></label>)}
        </div>)}
      </div>
    </section>
  )
}

interface Props {
  open: boolean
  role: Role | null
  catalog: PermissionDefinition[]
  onClose: () => void
  onSubmit: (d: RoleFormSubmit) => Promise<void>
}

export function RoleFormModal({ open, role, catalog, onClose, onSubmit }: Props) {
  const state = useRoleForm(role, onSubmit, onClose)
  const { form, setForm, permissionKeys, setPermissionKeys, permissionSearch, setPermissionSearch, loading, error, submit, codeInvalid, divisionInvalid, permissionsInvalid } = state
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [unitID, setUnitID] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [loadingStructure, setLoadingStructure] = useState(false)
  useEffect(() => {
    if (!open) return
    let alive = true
    setLoadingStructure(true)
    Promise.all([fetchAllTenantUnits(), fetchAllCategories(), fetchAllDivisions()])
      .then(([u, c, d]) => {
        if (!alive) return
        setUnits(u.filter(x => x.is_active)); setCategories(c.filter(x => x.is_active)); setDivisions(d.filter(x => x.is_active))
        if (role?.division_id) {
          const current = d.find(x => x.id === role.division_id)
          if (current) { setUnitID(String(current.unit_usaha_id)); setCategoryID(String(current.category_id)) }
        } else { setUnitID(''); setCategoryID('') }
      }).catch(() => { if (alive) { setUnits([]); setCategories([]); setDivisions([]) } })
      .finally(() => { if (alive) setLoadingStructure(false) })
    return () => { alive = false }
  }, [open, role])
  const availableCategories = categories.filter(c => c.unit_usaha_id === Number(unitID))
  const availableDivisions = divisions.filter(d => d.unit_usaha_id === Number(unitID) && d.category_id === Number(categoryID))
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="role-form-title">
      <div className="glass-card w-full max-w-xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <h3 id="role-form-title" className="font-heading text-lg font-semibold text-dark-100">{role ? 'Ubah Role' : 'Buat Role Baru'}</h3>
        {error && <div role="alert" className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Kode Role" placeholder="contoh: supervisor" value={form.name} disabled={!!role} required
            onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            error={codeInvalid ? 'Huruf kecil, angka, atau _ (3–50 karakter, diawali huruf)' : undefined}
            helper={role ? 'Kode role tidak dapat diubah.' : 'Dipakai sistem sebagai identitas role.'} />
          {!role && <>
            {loadingStructure ? <p className="text-xs text-dark-400">Memuat struktur organisasi...</p> : units.length === 0 ? <p className="text-xs text-warning">Belum ada unit usaha aktif. Buat atau aktifkan unit usaha terlebih dahulu.</p> : <>
              <SearchableSelect label="Unit Usaha" value={unitID} onChange={value => { setUnitID(value); setCategoryID(''); setForm({ ...form, division_id: 0 }) }} required options={units.map(u => ({ value: String(u.id), label: u.name }))} placeholder="Pilih unit usaha" />
              <SearchableSelect label="Kategori" value={categoryID} onChange={value => { setCategoryID(value); setForm({ ...form, division_id: 0 }) }} required disabled={!unitID} options={availableCategories.map(c => ({ value: String(c.id), label: c.name }))} placeholder={unitID ? 'Pilih kategori' : 'Pilih unit usaha terlebih dahulu'} />
              <SearchableSelect label="Divisi" value={form.division_id ? String(form.division_id) : ''} onChange={value => setForm({ ...form, division_id: Number(value) })} required disabled={!categoryID} options={availableDivisions.map(d => ({ value: String(d.id), label: d.name }))} placeholder={categoryID ? 'Pilih divisi' : 'Pilih kategori terlebih dahulu'} />
            </>}
          </>}
          {role && <p className="text-xs text-dark-400">Unit: {role.unit_name || '—'} · Kategori: {role.category_name || '—'} · Divisi: {role.division_name || `#${role.division_id ?? 'legacy'}`}</p>}
          <Input label="Nama Tampilan" placeholder="contoh: Supervisor Lapangan" value={form.display_name} required onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          <Textarea label="Deskripsi" placeholder="Tanggung jawab role ini..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {!role && <PermissionPicker catalog={catalog} selected={permissionKeys} onChange={setPermissionKeys} search={permissionSearch} onSearch={setPermissionSearch} />}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading} disabled={codeInvalid || divisionInvalid || permissionsInvalid || loadingStructure}>Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
