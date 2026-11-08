import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Building2, ArrowRight } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { registerPartner } from '@/features/m3/api'
import type { RegisterPartnerData, Partner } from '@/features/m3/types'

function SuccessActions({ id }: { id: number }) {
  return (
    <div className="pt-2 flex justify-center gap-3">
      <Link to={`/partner/status?id=${id}`}><Button><Building2 size={16} /> Cek Status Verifikasi</Button></Link>
      <Link to="/catalog"><Button variant="secondary">Kembali ke Katalog <ArrowRight size={16} /></Button></Link>
    </div>
  )
}

function RegisterSuccessCard({ partner }: { partner: Partner }) {
  return (
    <div className="glass-card max-w-lg mx-auto p-8 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
        <CheckCircle2 size={28} />
      </div>
      <h2 className="font-heading text-xl font-bold text-dark-100">Pendaftaran Berhasil Dikirim!</h2>
      <p className="text-sm text-dark-300">
        Terima kasih <strong>{partner.company_name}</strong>. Pendaftaran mitra Anda tercatat dengan ID:{' '}
        <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">#{partner.id}</span>
      </p>
      <div className="p-3 bg-white/5 border border-glass-border rounded-lg text-xs text-dark-400 text-left space-y-1">
        <p>• Status saat ini: <strong className="text-warning">PENDING (Menunggu Verifikasi)</strong></p>
        <p>• Administrator Super Admin Araya akan meninjau profil kemitraan Anda.</p>
      </div>
      <SuccessActions id={partner.id} />
    </div>
  )
}

function RegisterFormInputs({
  form, setForm,
}: {
  form: RegisterPartnerData; setForm: (f: RegisterPartnerData) => void
}) {
  return (
    <div className="space-y-3">
      <Input label="Nama Perusahaan / Entitas Usaha" placeholder="PT / CV / UD Mitra Makmur" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
      <Input label="Nama Penanggung Jawab (PIC)" placeholder="Bpk. Budi Santoso" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Email Perusahaan" type="email" placeholder="mitra@perusahaan.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Nomor Telepon / WhatsApp" placeholder="08123456789" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      </div>
      <Textarea label="Alamat Kantor / Operasional" placeholder="Alamat lengkap fasilitas operasional" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
    </div>
  )
}

function usePartnerRegister() {
  const [form, setForm] = useState<RegisterPartnerData>({ company_name: '', contact_person: '', email: '', phone: '', address: '' })
  const [result, setResult] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { const p = await registerPartner(form); setResult(p) }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Pendaftaran gagal') }
    finally { setLoading(false) }
  }
  return { form, setForm, result, loading, error, submit }
}

function RegisterFormCard({
  form, setForm, loading, error, submit,
}: ReturnType<typeof usePartnerRegister>) {
  return (
    <div className="glass-card p-6 sm:p-8 space-y-4">
      {error && <div className="text-xs text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <RegisterFormInputs form={form} setForm={setForm} />
        <Button type="submit" loading={loading} className="w-full">Kirim Pengajuan Pendaftaran Mitra</Button>
      </form>
      <p className="text-xs text-dark-400 text-center pt-2">
        Sudah pernah mendaftar? <Link to="/partner/status" className="text-brand-400 hover:underline">Cek status pendaftaran</Link>
      </p>
    </div>
  )
}

export function PublicPartnerRegisterPage() {
  const state = usePartnerRegister()
  if (state.result) return <RegisterSuccessCard partner={state.result} />

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-100">
          Pendaftaran <span className="text-brand-400">Mitra Bisnis</span>
        </h1>
        <p className="text-sm text-dark-400">Bergabunglah ke ekosistem B2B Araya Hub. Pendaftaran akan diverifikasi oleh Super Admin.</p>
      </div>
      <RegisterFormCard {...state} />
    </div>
  )
}
