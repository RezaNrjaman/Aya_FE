/** User creation follows Partner -> Unit -> Category -> Division -> Role -> User. */
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button, Input, SearchableSelect } from '@/components/ui'
import { fetchRoles } from '@/features/m1/api'
import type { Role, CreateUserData } from '@/features/m1/types'
import { fetchAllTenantUnits, fetchAllCategories, fetchAllDivisions } from '@/features/m2/api'
import type { BusinessUnit, BusinessCategory, Division } from '@/features/m2/types'
import { errorMessage } from '@/features/m1/access'

const EMPTY = { name: '', email: '', password: '', phone: '', unit: '', category: '', division: '', role: '' }

export function UserFormModal({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (data: CreateUserData) => Promise<void>
}) {
  const [form, setForm] = useState(EMPTY)
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStructure, setLoadingStructure] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open) return
    setForm(EMPTY); setError(''); setLoadingStructure(true)
    Promise.all([fetchAllTenantUnits(), fetchAllCategories(), fetchAllDivisions(), fetchRoles()])
      .then(([u, c, d, r]) => { setUnits(u.filter(x => x.is_active)); setCategories(c.filter(x => x.is_active)); setDivisions(d.filter(x => x.is_active)); setRoles(r.filter(x => x.is_active)) })
      .catch(() => setError('Gagal memuat struktur organisasi. Pastikan akun memiliki izin membaca unit usaha, kategori, divisi, dan role.'))
      .finally(() => setLoadingStructure(false))
  }, [open])
  const availableCategories = useMemo(() => categories.filter(c => c.unit_usaha_id === Number(form.unit)), [categories, form.unit])
  const availableDivisions = useMemo(() => divisions.filter(d => d.unit_usaha_id === Number(form.unit) && d.category_id === Number(form.category)), [divisions, form.unit, form.category])
  const availableRoles = useMemo(() => roles.filter(r => r.division_id === Number(form.division)), [roles, form.division])
  if (!open) return null
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!form.unit || !form.category || !form.division || !form.role) { setError('Unit usaha, kategori, divisi, dan role wajib dipilih.'); return }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name, email: form.email, password: form.password, phone: form.phone,
        unit_usaha_id: Number(form.unit), division_id: Number(form.division), role: form.role,
      })
      onClose()
    } catch (err) { setError(errorMessage(err, 'Gagal menyimpan pengguna')) }
    finally { setLoading(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
    <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[92vh] overflow-y-auto">
      <h3 id="user-form-title" className="font-heading text-lg font-semibold text-dark-100">Tambah Pengguna Baru</h3>
      <p className="text-xs text-dark-400">Pengguna ditempatkan pada satu divisi dan hanya dapat menerima role dari divisi tersebut.</p>
      {loadingStructure && <p className="text-xs text-dark-400">Memuat struktur organisasi...</p>}
      {!loadingStructure && units.length === 0 && !error && <p className="text-xs text-warning">Belum ada unit usaha aktif. Buat unit usaha terlebih dahulu.</p>}
      {error && <div role="alert" className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <Input label="Nama Lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <Input label="Password Awal" type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required helper="Minimal 8 karakter" />
        <Input label="Nomor Telepon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <SearchableSelect label="Unit Usaha" value={form.unit} onChange={value => setForm({ ...form, unit: value, category: '', division: '', role: '' })} required
          options={units.map(u => ({ value: String(u.id), label: u.name }))} placeholder="Pilih unit usaha" />
        <SearchableSelect label="Kategori" value={form.category} onChange={value => setForm({ ...form, category: value, division: '', role: '' })} required disabled={!form.unit}
          options={availableCategories.map(c => ({ value: String(c.id), label: c.name }))} placeholder={form.unit ? 'Pilih kategori' : 'Pilih unit usaha terlebih dahulu'} />
        <SearchableSelect label="Divisi" value={form.division} onChange={value => setForm({ ...form, division: value, role: '' })} required disabled={!form.category}
          options={availableDivisions.map(d => ({ value: String(d.id), label: d.name }))} placeholder={form.category ? 'Pilih divisi' : 'Pilih kategori terlebih dahulu'} />
        <SearchableSelect label="Role" value={form.role} onChange={value => setForm({ ...form, role: value })} required disabled={!form.division}
          options={availableRoles.map(r => ({ value: r.name, label: r.display_name }))} placeholder={form.division ? 'Pilih role pada divisi ini' : 'Pilih divisi terlebih dahulu'} />
        <div className="flex justify-end gap-2 pt-2"><Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button><Button type="submit" loading={loading} disabled={loadingStructure || !form.unit || !form.category || !form.division || !form.role}>Simpan</Button></div>
      </form>
    </div>
  </div>
}
