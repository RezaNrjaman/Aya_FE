import { Button } from '@/components/ui'
import type { AuditLog } from '@/features/m1/types'

function AuditGridInfo({ log }: { log: AuditLog }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-dark-300">
      <div><span className="text-dark-500">Waktu:</span> {new Date(log.created_at).toLocaleString('id-ID')}</div>
      <div><span className="text-dark-500">Aktor:</span> {log.user_name || 'Sistem'}</div>
      <div><span className="text-dark-500">Aksi:</span> <strong className="text-brand-400">{log.action}</strong></div>
      <div><span className="text-dark-500">Objek:</span> {log.entity_type} #{log.entity_id || '—'}</div>
      <div className="col-span-2"><span className="text-dark-500">IP Address:</span> {log.ip_address || '—'}</div>
    </div>
  )
}

export function AuditDetailModal({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  if (!log) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Detail Aktivitas #{log.id}</h3>
        <AuditGridInfo log={log} />
        <div>
          <p className="text-xs font-semibold uppercase text-dark-400 mb-1">Payload / Detail:</p>
          <pre className="glass-input p-3 text-xs font-mono text-dark-200 overflow-x-auto max-h-48 rounded">
            {log.details ? JSON.stringify(log.details, null, 2) : 'Tidak ada detail data.'}
          </pre>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  )
}
