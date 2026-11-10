import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ShieldCheck } from 'lucide-react'
import { Button, Input, StatusBadge } from '@/components/ui'
import { getPublicPartnerStatus, activateAccount } from '@/features/m3/api'
import type { PublicPartnerStatus } from '@/features/m3/types'

/**
 * Public partner registration status page.
 *
 * ARY-002: the page no longer exposes any initial password and is addressed by
 * an unguessable registration code instead of the sequential partner ID. The
 * response is minimal — no contact details or verification history. When the
 * partner has just been verified and has never activated the account, the
 * single-use activation invitation is offered here (sandbox stand-in for the
 * invitation e-mail).
 */

function statusVariant(status: string) {
  return status === 'terverifikasi'
    ? 'success'
    : status === 'ditolak' || status === 'ditangguhkan'
      ? 'danger'
      : 'warning'
}

function statusMessage(status: PublicPartnerStatus): string {
  switch (status.status) {
    case 'pending':
      return 'Permohonan kemitraan Anda sedang menunggu verifikasi Administrator Araya Hub.'
    case 'terverifikasi':
      return 'Kemitraan Anda telah terverifikasi dan aktif.'
    case 'ditolak':
      return status.rejection_reason
        ? `Permohonan ditolak: ${status.rejection_reason}`
        : 'Permohonan kemitraan ditolak.'
    case 'ditangguhkan':
      return status.suspension_reason
        ? `Kemitraan ditangguhkan: ${status.suspension_reason}`
        : 'Kemitraan saat ini ditangguhkan.'
    default:
      return ''
  }
}

function ActivationCard({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak sama')
      return
    }
    setLoading(true)
    try {
      await activateAccount({ token, password })
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Aktivasi gagal')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <ShieldCheck size={16} /> Akun berhasil diaktivasi
        </div>
        <p className="text-dark-300">Silakan masuk menggunakan email partner dan kata sandi yang baru Anda buat.</p>
        <Link to="/login" className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition">
          Masuk ke Portal Mitra →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-3">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
        <ShieldCheck size={16} /> Kemitraan Terverifikasi — Aktivasikan Akun Anda
      </div>
      <p className="text-dark-300">
        Buat kata sandi kuat (minimal 8 karakter) untuk mengaktifkan akun login partner Anda. Tautan aktivasi ini hanya
        berlaku sekali dan memiliki masa berlaku terbatas.
      </p>
      {error && <div className="text-danger bg-danger/10 border border-danger/20 rounded p-2">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input label="Kata Sandi Baru" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <Input label="Ulangi Kata Sandi" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
      </div>
      <Button type="submit" loading={loading}>Aktivasikan Akun</Button>
    </form>
  )
}

function PartnerStatusCard({ detail }: { detail: PublicPartnerStatus }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-dark-100">{detail.company_name}</h3>
          <p className="text-xs text-dark-400">Status pendaftaran kemitraan Anda saat ini.</p>
        </div>
        <StatusBadge label={detail.status.toUpperCase()} variant={statusVariant(detail.status)} />
      </div>
      <p className="text-sm text-dark-300 border-t border-glass-border pt-3">{statusMessage(detail)}</p>
      {detail.status === 'terverifikasi' && detail.activation_token && <ActivationCard token={detail.activation_token} />}
      {detail.status === 'terverifikasi' && !detail.activation_token && (
        <div className="p-3 rounded-lg bg-white/[0.03] border border-glass-border text-xs text-dark-400">
          Akun partner Anda sudah aktif. Silakan masuk dengan email partner dan kata sandi Anda.
          {' '}
          <Link to="/login" className="text-brand-400 hover:underline">Masuk →</Link>
        </div>
      )}
    </div>
  )
}

function usePartnerStatusSearch() {
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [detail, setDetail] = useState<PublicPartnerStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (c: string) => {
    setError(''); setDetail(null); setLoading(true)
    try { setDetail(await getPublicPartnerStatus(c)) }
    catch { setError('Kode pelacakan tidak dikenali. Periksa kembali kode pendaftaran Anda.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const c = params.get('code')
    if (c) { search(c) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const submit = (e: FormEvent) => { e.preventDefault(); if (code.trim()) search(code.trim()) }
  return { code, setCode, detail, loading, error, submit }
}

function StatusSearchHeader() {
  return (
    <div className="text-center space-y-2">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-100">
        Cek Status <span className="text-brand-400">Pendaftaran Mitra</span>
      </h1>
      <p className="text-sm text-dark-400">Masukkan kode pelacakan yang Anda terima saat pendaftaran untuk memantau proses verifikasi.</p>
    </div>
  )
}

export function PublicPartnerStatusPage() {
  const { code, setCode, detail, loading, error, submit } = usePartnerStatusSearch()

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      <StatusSearchHeader />
      <div className="glass-card p-6 space-y-4">
        <form onSubmit={submit} className="flex gap-2">
          <Input placeholder="Masukkan kode pelacakan pendaftaran" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Button type="submit" loading={loading}><Search size={16} /> Cek</Button>
        </form>
        <p className="text-[11px] text-dark-500">
          Kode pelacakan ditampilkan setelah Anda menyelesaikan pendaftaran. Jika kode hilang, hubungi Administrator Araya Hub.
        </p>
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
