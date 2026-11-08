import { useState, type FormEvent } from 'react'
import { Button, Textarea } from '@/components/ui'
import type { Partner } from '@/features/m3/types'

function useSuspendState(partner: Partner | null, onClose: () => void, onSuspend: (id: number, reason: string) => Promise<void>) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const execute = async (e: FormEvent) => {
    e.preventDefault()
    if (!partner) return
    if (!reason.trim()) { setError('Alasan penangguhan wajib diisi'); return }
    setError(''); setLoading(true)
    try { await onSuspend(partner.id, reason.trim()); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal menangguhkan mitra') }
    finally { setLoading(false) }
  }
  return { reason, setReason, loading, error, execute }
}

export function PartnerSuspendModal({ partner, onClose, onSuspend }: { partner: Partner | null; onClose: () => void; onSuspend: (id: number, reason: string) => Promise<void> }) {
  const { reason, setReason, loading, error, execute } = useSuspendState(partner, onClose, onSuspend)
  if (!partner) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Tangguhkan Mitra Bisnis</h3>
        <p className="text-xs text-dark-300">Mitra <strong className="text-dark-100">{partner.company_name}</strong> akan dihentikan sementara dari akses dan katalog.</p>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={execute} className="space-y-3">
          <Textarea label="Alasan Penangguhan" placeholder="Pelanggaran SOP / keluhan kualitas..." value={reason} onChange={(e) => setReason(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button variant="danger" type="submit" loading={loading}>Tangguhkan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

