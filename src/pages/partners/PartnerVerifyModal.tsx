import { useState, type FormEvent } from 'react'
import { Button, Textarea } from '@/components/ui'
import type { Partner } from '@/features/m3/types'

function useVerifyState(partner: Partner | null, onDone: () => void, onVerify: (id: number, act: 'approve' | 'reject', r?: string) => Promise<void>) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const execute = async (action: 'approve' | 'reject') => {
    if (!partner) return
    if (action === 'reject' && !reason.trim()) { setError('Alasan penolakan wajib diisi'); return }
    setError(''); setLoading(true)
    try { await onVerify(partner.id, action, reason.trim() || undefined); onDone() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal memproses verifikasi') }
    finally { setLoading(false) }
  }
  return { reason, setReason, loading, error, execute }
}

export function PartnerVerifyModal({ partner, onClose, onVerify }: { partner: Partner | null; onClose: () => void; onVerify: (id: number, act: 'approve' | 'reject', r?: string) => Promise<void> }) {
  const { reason, setReason, loading, error, execute } = useVerifyState(partner, onClose, onVerify)
  if (!partner) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Verifikasi Pendaftaran Mitra</h3>
        <p className="text-xs text-dark-300">Entitas: <strong className="text-dark-100">{partner.company_name}</strong> ({partner.contact_person})</p>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <Textarea label="Catatan / Alasan (Wajib jika Menolak)" placeholder="Masukkan alasan jika permohonan ditolak..." value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
          <Button variant="danger" type="button" onClick={() => execute('reject')} loading={loading}>Tolak Pendaftaran</Button>
          <Button variant="primary" type="button" onClick={() => execute('approve')} loading={loading}>Setujui Mitra</Button>
        </div>
      </div>
    </div>
  )
}

