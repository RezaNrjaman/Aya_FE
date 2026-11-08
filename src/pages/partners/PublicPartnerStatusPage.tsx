import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button, Input, StatusBadge } from '@/components/ui'
import { getPublicPartnerStatus } from '@/features/m3/api'
import type { PartnerDetail } from '@/features/m3/types'

function StatusTimeline({ detail }: { detail: PartnerDetail }) {
  return (
    <div className="space-y-2 pt-2 border-t border-glass-border">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-400">Riwayat Status Verifikasi</h4>
      <div className="space-y-1.5">
        {detail.histories?.map((h, i) => (
          <div key={i} className="text-xs p-2 rounded bg-white/[0.02] border border-glass-border flex justify-between items-start">
            <div>
              <span className="font-semibold text-dark-200 uppercase">{h.to_status}</span>
              {h.reason && <p className="text-dark-400 text-[11px] mt-0.5">Catatan: {h.reason}</p>}
            </div>
            <span className="text-[11px] font-mono text-dark-500">{new Date(h.created_at).toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VerifiedPartnerAccountBanner({ email }: { email: string }) {
  return (
    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
        <span>✓ Kemitraan Anda Telah Terverifikasi & Aktif!</span>
      </div>
      <p className="text-dark-300">
        Akun login Anda telah aktif. Silakan masuk menggunakan email <strong className="text-emerald-300">{email}</strong> dan kata sandi sementara <code className="px-1.5 py-0.5 bg-black/40 text-brand-300 rounded font-mono">Partner123!</code>.
      </p>
      <Link to="/login" className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition">
        Masuk ke Portal Mitra →
      </Link>
    </div>
  )
}

function PartnerStatusCard({ detail }: { detail: PartnerDetail }) {
  const p = detail.partner
  const isVerified = p.status === 'terverifikasi'
  const v = isVerified ? 'success' : p.status === 'ditolak' || p.status === 'ditangguhkan' ? 'danger' : 'warning'
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono text-brand-400">ID Mitra #{p.id}</span>
          <h3 className="font-heading text-lg font-bold text-dark-100">{p.company_name}</h3>
          <p className="text-xs text-dark-400">PIC: {p.contact_person} • {p.email} • {p.phone}</p>
        </div>
        <StatusBadge label={p.status.toUpperCase()} variant={v} />
      </div>
      {isVerified && <VerifiedPartnerAccountBanner email={p.email} />}
      <StatusTimeline detail={detail} />
    </div>
  )
}

function usePartnerStatusSearch() {
  const [params] = useSearchParams()
  const [queryId, setQueryId] = useState(params.get('id') || '')
  const [detail, setDetail] = useState<PartnerDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (idNum: number) => {
    setError(''); setDetail(null); setLoading(true)
    try { const res = await getPublicPartnerStatus(idNum); setDetail(res) }
    catch { setError('Data pendaftaran mitra dengan ID tersebut tidak ditemukan') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const id = params.get('id')
    if (id && parseInt(id, 10)) { search(parseInt(id, 10)) }
  }, [params])

  const submit = (e: FormEvent) => { e.preventDefault(); if (parseInt(queryId, 10)) search(parseInt(queryId, 10)) }
  return { queryId, setQueryId, detail, loading, error, submit }
}

function StatusSearchHeader() {
  return (
    <div className="text-center space-y-2">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-100">
        Cek Status <span className="text-brand-400">Pendaftaran Mitra</span>
      </h1>
      <p className="text-sm text-dark-400">Pantau proses verifikasi permohonan kemitraan Anda oleh Administrator Araya Hub.</p>
    </div>
  )
}

export function PublicPartnerStatusPage() {
  const { queryId, setQueryId, detail, loading, error, submit } = usePartnerStatusSearch()

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      <StatusSearchHeader />
      <div className="glass-card p-6 space-y-4">
        <form onSubmit={submit} className="flex gap-2">
          <Input placeholder="Masukkan Nomor ID Mitra (contoh: 1)" value={queryId} onChange={(e) => setQueryId(e.target.value)} type="number" required />
          <Button type="submit" loading={loading}><Search size={16} /> Cek</Button>
        </form>
      </div>
      {error && <div className="text-xs text-danger bg-danger/10 p-3 rounded-lg border border-danger/20 text-center">{error}</div>}
      {detail && <PartnerStatusCard detail={detail} />}
      <div className="text-center pt-2">
        <Link to="/partner/register" className="text-xs text-dark-400 hover:text-brand-400">
          Belum terdaftar sebagai mitra? <strong className="underline">Daftar sekarang</strong>
        </Link>
      </div>
    </div>
  )
}
