/** M1-007: Permission matrix — configure every permission of a role in one save */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Lock, Search } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchAvailablePermissions, type PermissionDefinition } from '@/features/m1/api'
import { PERM_ROLES_MANAGE, PERM_ROLES_READ, PROTECTED_ROLE, errorMessage, moduleLabel } from '@/features/m1/access'
import type { Role } from '@/features/m1/types'

const LOCK_KEYS = [PERM_ROLES_READ, PERM_ROLES_MANAGE]

function usePermissionCatalog(open: boolean) {
  const [catalog, setCatalog] = useState<PermissionDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    if (!open) return
    let alive = true
    fetchAvailablePermissions()
      .then((d) => { if (alive) setCatalog(d.filter((p) => p.is_active)) })
      .catch((e) => { if (alive) setLoadError(errorMessage(e, 'Gagal memuat daftar hak akses')) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [open])
  return { catalog, loading, loadError }
}

function groupByModule(perms: PermissionDefinition[], query: string) {
  const q = query.trim().toLowerCase()
  const match = (p: PermissionDefinition) => !q || [p.key, p.name, p.description].some((v) => v?.toLowerCase().includes(q))
  const groups = new Map<string, PermissionDefinition[]>()
  perms.filter(match).forEach((p) => groups.set(p.module, [...(groups.get(p.module) ?? []), p]))
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}

function diffCount(initial: Set<string>, selected: Set<string>) {
  const added = [...selected].filter((k) => !initial.has(k)).length
  const removed = [...initial].filter((k) => !selected.has(k)).length
  return { added, removed }
}

function GroupCheckbox({ keys, selected, locked, onToggle }: { keys: string[]; selected: Set<string>; locked: Set<string>; onToggle: (keys: string[], on: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const editable = keys.filter((k) => !locked.has(k))
  const count = editable.filter((k) => selected.has(k)).length
  const all = editable.length > 0 && count === editable.length
  useEffect(() => { if (ref.current) ref.current.indeterminate = count > 0 && !all }, [count, all])
  return (
    <label className="flex items-center gap-2 text-xs text-dark-300 cursor-pointer select-none">
      <input ref={ref} type="checkbox" className="accent-brand-500 h-4 w-4" checked={all} disabled={editable.length === 0} onChange={(e) => onToggle(editable, e.target.checked)} />
      Pilih semua
    </label>
  )
}

function PermissionItem({ perm, checked, locked, onToggle }: { perm: PermissionDefinition; checked: boolean; locked: boolean; onToggle: (on: boolean) => void }) {
  return (
    <label className={`flex items-start gap-3 p-2.5 rounded-lg border transition ${checked ? 'border-brand-500/30 bg-brand-500/5' : 'border-glass-border bg-white/[0.02]'} ${locked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.05]'}`}>
      <input type="checkbox" className="accent-brand-500 mt-0.5 h-4 w-4 shrink-0" checked={checked} disabled={locked} onChange={(e) => onToggle(e.target.checked)} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-dark-100">
          {perm.name}
          {locked && <Lock size={12} className="text-warning" aria-label="Terkunci" />}
        </span>
        {perm.description && <span className="block text-xs text-dark-400 mt-0.5">{perm.description}</span>}
        <span className="inline-block mt-1 font-mono text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded break-all">{perm.key}</span>
      </span>
    </label>
  )
}

interface GroupProps {
  module: string; perms: PermissionDefinition[]; selected: Set<string>; locked: Set<string>
  onToggle: (keys: string[], on: boolean) => void
}

function ModuleGroup({ module, perms, selected, locked, onToggle }: GroupProps) {
  const keys = perms.map((p) => p.key)
  const chosen = keys.filter((k) => selected.has(k)).length
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2 sticky top-0 z-10 py-1.5 bg-dark-900/90 backdrop-blur">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-300">
          {moduleLabel(module)} <span className="text-dark-500 normal-case font-normal">· {chosen}/{keys.length}</span>
        </h4>
        <GroupCheckbox keys={keys} selected={selected} locked={locked} onToggle={onToggle} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {perms.map((p) => (
          <PermissionItem key={p.key} perm={p} checked={selected.has(p.key)} locked={locked.has(p.key)} onToggle={(on) => onToggle([p.key], on)} />
        ))}
      </div>
    </section>
  )
}

function useMatrixState(role: Role) {
  const { user } = useAuth()
  const initial = useMemo(() => new Set((role.permissions ?? []).map((p) => p.key)), [role])
  const [selected, setSelected] = useState<Set<string>>(initial)
  const guarded = role.name === PROTECTED_ROLE || role.name === user?.role
  const locked = useMemo(() => new Set(guarded ? LOCK_KEYS : []), [guarded])
  const toggle = (keys: string[], on: boolean) => setSelected((prev) => {
    const next = new Set(prev)
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)))
    return next
  })
  return { initial, selected, locked, guarded, toggle, ...diffCount(initial, selected) }
}

function MatrixHeader({ role, guarded, total, selectedCount }: { role: Role; guarded: boolean; total: number; selectedCount: number }) {
  return (
    <div className="space-y-2">
      <div>
        <h3 id="matrix-title" className="font-heading text-lg font-semibold text-dark-100">Atur Hak Akses</h3>
        <p className="text-xs text-dark-400">Role <strong className="text-brand-400">{role.display_name}</strong> <span className="font-mono">({role.name})</span> · {selectedCount} dari {total} hak akses dipilih</p>
      </div>
      {!role.is_active && <p className="text-xs text-warning bg-warning/10 border border-warning/20 rounded p-2">Role ini nonaktif. Pengaturan disimpan, tetapi tidak berlaku sampai role diaktifkan kembali.</p>}
      {guarded && <p className="text-xs text-dark-300 bg-white/5 border border-glass-border rounded p-2 flex gap-2"><Lock size={14} className="text-warning shrink-0 mt-0.5" />Hak akses mengelola role dikunci pada role ini agar tidak ada yang terkunci keluar dari pengaturan.</p>}
    </div>
  )
}

function MatrixBody({ loading, loadError, groups, state }: { loading: boolean; loadError: string; groups: [string, PermissionDefinition[]][]; state: ReturnType<typeof useMatrixState> }) {
  if (loading) return <p className="text-sm text-dark-400 text-center py-8">Memuat daftar hak akses...</p>
  if (loadError) return <p className="text-sm text-danger text-center py-8">{loadError}</p>
  if (groups.length === 0) return <p className="text-sm text-dark-400 text-center py-8">Tidak ada hak akses yang cocok dengan pencarian.</p>
  return (
    <>
      {groups.map(([m, perms]) => (
        <ModuleGroup key={m} module={m} perms={perms} selected={state.selected} locked={state.locked} onToggle={state.toggle} />
      ))}
    </>
  )
}

export function PermissionMatrixModal({ role, onClose, onSave }: { role: Role; onClose: () => void; onSave: (role: string, keys: string[]) => Promise<void> }) {
  const { catalog, loading, loadError } = usePermissionCatalog(true)
  const state = useMatrixState(role)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const groups = useMemo(() => groupByModule(catalog, query), [catalog, query])
  const dirty = state.added + state.removed > 0

  const save = async () => {
    setSaving(true); setError('')
    try { await onSave(role.name, [...state.selected].sort()); onClose() }
    catch (e) { setError(errorMessage(e, 'Gagal menyimpan hak akses')) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="matrix-title" onKeyDown={(e) => e.key === 'Escape' && !saving && onClose()}>
      <div className="glass-card w-full max-w-3xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col">
        <MatrixHeader role={role} guarded={state.guarded} total={catalog.length} selectedCount={state.selected.size} />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari hak akses (nama atau kode)..." aria-label="Cari hak akses" className="glass-input w-full pl-8 pr-3 py-2 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
        </div>
        {error && <div role="alert" className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-[200px]">
          <MatrixBody loading={loading} loadError={loadError} groups={groups} state={state} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-glass-border">
          <span className="text-xs text-dark-400">{dirty ? <><span className="text-success">+{state.added} ditambah</span> · <span className="text-danger">−{state.removed} dicabut</span></> : 'Belum ada perubahan'}</span>
          <div className="flex gap-2">
            <Button variant="tertiary" onClick={onClose} disabled={saving}>Batal</Button>
            <Button onClick={save} loading={saving} disabled={!dirty || loading}>Simpan Perubahan</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
