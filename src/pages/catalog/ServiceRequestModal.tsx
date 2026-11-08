/** M5-005: Custom Service Request Modal */
import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'
import type { BusinessUnitSummary, CreateServiceRequestData } from '@/features/m5/types'

function useServiceRequestForm(
  onSubmit: (d: CreateServiceRequestData) => Promise<void>,
  onClose: () => void,
) {
  const [form, setForm] = useState<CreateServiceRequestData>({
    unit_usaha_id: 1, customer_name: '', customer_email: '', customer_phone: '', service_type: 'Pengadaan Khusus', description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal mengirim pengajuan layanan') }
    finally { setLoading(false) }
  }
  return { form, setForm, loading, error, submit }
}

function ServiceRequestInputs({
  form, setForm, units,
}: {
  form: CreateServiceRequestData; setForm: (f: CreateServiceRequestData) => void; units: BusinessUnitSummary[]
}) {
  return (
    <>
      <Select label="Pilih Unit Usaha Tujuan" value={String(form.unit_usaha_id)} onChange={(e) => setForm({ ...form, unit_usaha_id: parseInt(e.target.value, 10) })} options={units.map((u) => ({ value: String(u.id), label: u.name }))} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nama Lengkap" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
        <Input label="Email Kontak" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nomor Telepon / WhatsApp" value={form.customer_phone || ''} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
        <Input label="Jenis Layanan" value={form.service_type || ''} onChange={(e) => setForm({ ...form, service_type: e.target.value })} placeholder="contoh: Instalasi / Konsultasi" />
      </div>
      <Textarea label="Deskripsi Kebutuhan Layanan" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Jelaskan kebutuhan spesifikasi, jadwal, dan ekspektasi layanan..." required />
    </>
  )
}

function ServiceModalHeader() {
  return (
    <div>
      <h3 className="font-heading text-lg font-semibold text-dark-100">Ajukan Permintaan Jasa Kustom</h3>
      <p className="text-xs text-dark-400">Tim unit usaha terkait akan meninjau dan menerbitkan draf penawaran resmi.</p>
    </div>
  )
}

export function ServiceRequestModal({
  open, units, onClose, onSubmit,
}: {
  open: boolean; units: BusinessUnitSummary[]; onClose: () => void; onSubmit: (d: CreateServiceRequestData) => Promise<void>
}) {
  const { form, setForm, loading, error, submit } = useServiceRequestForm(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <ServiceModalHeader />
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <ServiceRequestInputs form={form} setForm={setForm} units={units} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Kirim Permintaan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
