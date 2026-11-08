import { useState, useEffect } from 'react'
import { Button, StatusBadge } from '@/components/ui'
import { getPartner } from '@/features/m3/api'
import type { Partner, PartnerDetail, StatusHistory } from '@/features/m3/types'

function usePartnerDetail(partner: Partner | null) {
  const [detail, setDetail] = useState<PartnerDetail | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!partner) { setDetail(null); return }
    setLoading(true)
    getPartner(partner.id)
      .then((d) => setDetail(d))
      .catch(() => setDetail({ partner, histories: [] }))
      .finally(() => setLoading(false))
  }, [partner])
  return { detail, loading }
}

function StatusHistoryList({ histories }: { histories: StatusHistory[] }) {
  if (histories.length === 0) return <p className="text-xs text-dark-500 italic">Belum ada riwayat transisi status.</p>
  return (
    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
      {histories.map((h) => (
        <div key={h.id} className="text-xs glass-input p-2 rounded space-y-0.5">
          <div className="flex justify-between text-dark-400">
            <span>{h.from_status} → <strong className="text-dark-200">{h.to_status}</strong></span>
            <span className="font-mono">{new Date(h.created_at).toLocaleString('id-ID')}</span>
          </div>
          {h.reason && <p className="text-dark-300 italic">"{h.reason}"</p>}
          <p className="text-dark-500">Oleh: {h.created_by}</p>
        </div>
      ))}
    </div>
  )
}

function PartnerInfoView({ p }: { p: Partner }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-dark-300">
      <div><span className="text-dark-500">Perusahaan:</span> <strong className="text-dark-100">{p.company_name}</strong></div>
      <div><span className="text-dark-500">PIC:</span> {p.contact_person}</div>
      <div><span className="text-dark-500">Email:</span> {p.email}</div>
      <div><span className="text-dark-500">Telepon:</span> {p.phone}</div>
      <div className="col-span-2"><span className="text-dark-500">Alamat:</span> {p.address || '—'}</div>
      {p.rejection_reason && <div className="col-span-2 text-danger"><span className="font-semibold">Alasan Ditolak:</span> {p.rejection_reason}</div>}
      {p.suspension_reason && <div className="col-span-2 text-warning"><span className="font-semibold">Alasan Ditangguhkan:</span> {p.suspension_reason}</div>}
    </div>
  )
}

export function PartnerDetailModal({ partner, onClose }: { partner: Partner | null; onClose: () => void }) {
  const { detail, loading } = usePartnerDetail(partner)
  if (!partner) return null
  const p = detail?.partner || partner
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-dark-100">Detail Mitra Bisnis</h3>
          <StatusBadge label={p.status.toUpperCase()} variant={p.status === 'terverifikasi' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'} />
        </div>
        {loading ? <p className="text-xs text-dark-400 py-4 text-center">Memuat riwayat...</p> : <PartnerInfoView p={p} />}
        <div className="pt-2">
          <h4 className="text-xs font-semibold uppercase text-dark-400 mb-2">Riwayat Transisi Status</h4>
          <StatusHistoryList histories={detail?.histories || []} />
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  )
}

