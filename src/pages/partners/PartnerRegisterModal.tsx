import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/ui'
import type { RegisterPartnerData } from '@/features/m3/types'

function useRegisterState() {
  const [form, setForm] = useState<RegisterPartnerData>({ company_name: '', contact_person: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  return { form, setForm, loading, setLoading, error, setError }
}

function RegisterInputs({ form, setForm }: { form: RegisterPartnerData; setForm: (f: RegisterPartnerData) => void }) {
  return (
    <>
      <Input label="Nama Perusahaan / Entitas Mitra" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
      <Input label="Nama Penanggung Jawab (PIC)" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email Perusahaan" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Nomor Telepon / WA" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      </div>
      <Textarea label="Alamat Kantor / Operasional" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
    </>
  )
}

export function PartnerRegisterModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (d: RegisterPartnerData) => Promise<void> }) {
  const { form, setForm, loading, setLoading, error, setError } = useRegisterState()
  if (!open) return null
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal mendaftarkan mitra') }
    finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Daftarkan Mitra Bisnis Baru</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <RegisterInputs form={form} setForm={setForm} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Daftarkan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

