import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { fetchAvailablePermissions, type PermissionDefinition } from '@/features/m1/api'
import type { Role } from '@/features/m1/types'

function useAvailablePermissions(role: Role | null) {
  const [list, setList] = useState<PermissionDefinition[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!role) return
    setLoading(true)
    fetchAvailablePermissions()
      .then((data) => setList(data.filter((p) => !role.permissions?.some((rp) => rp.key === p.key))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [role])
  return { list, loading }
}

function PermissionRow({
  perm,
  onAssign,
  assigning,
}: {
  perm: PermissionDefinition
  onAssign: (key: string) => Promise<void>
  assigning: string | null
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-glass-border hover:bg-white/[0.05] transition">
      <div>
        <p className="text-xs font-semibold text-dark-100">{perm.name}</p>
        <p className="text-[11px] text-dark-400">{perm.description}</p>
        <span className="font-mono text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
          {perm.key}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onAssign(perm.key)}
        loading={assigning === perm.key}
      >
        <Plus size={14} /> Tambah
      </Button>
    </div>
  )
}

function PermissionGroup({
  moduleName,
  perms,
  onAssign,
  assigning,
}: {
  moduleName: string
  perms: PermissionDefinition[]
  onAssign: (key: string) => Promise<void>
  assigning: string | null
}) {
  if (perms.length === 0) return null
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-400 px-1">
        Modul {moduleName.toUpperCase()}
      </h4>
      <div className="space-y-1">
        {perms.map((p) => (
          <PermissionRow key={p.key} perm={p} onAssign={onAssign} assigning={assigning} />
        ))}
      </div>
    </div>
  )
}

export function AddPermissionModal({
  role,
  onClose,
  onSubmit,
}: {
  role: Role | null
  onClose: () => void
  onSubmit: (role: string, key: string) => Promise<void>
}) {
  const { list, loading } = useAvailablePermissions(role)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [error, setError] = useState('')
  if (!role) return null

  const handleAssign = async (key: string) => {
    setAssigning(key); setError('')
    try { await onSubmit(role.name, key); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal') }
    finally { setAssigning(null) }
  }

  const modules = ['m1', 'm2', 'm3', 'm4', 'm5']
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[85vh] flex flex-col">
        <div>
          <h3 className="font-heading text-lg font-semibold text-dark-100">Pilih Hak Akses</h3>
          <p className="text-xs text-dark-400">Role: <strong className="text-brand-400">{role.display_name}</strong> ({role.name})</p>
        </div>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading && <p className="text-xs text-dark-400 text-center py-4">Memuat daftar permission...</p>}
          {!loading && list.length === 0 && <p className="text-xs text-dark-400 text-center py-4">Semua hak akses telah dimiliki oleh role ini.</p>}
          {!loading && modules.map((m) => (
            <PermissionGroup key={m} moduleName={m} perms={list.filter((p) => p.module === m)} onAssign={handleAssign} assigning={assigning} />
          ))}
        </div>
        <div className="flex justify-end pt-2 border-t border-glass-border">
          <Button variant="tertiary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  )
}
