import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/ui'

interface CustomerFormData { name: string; email: string; phone?: string; address?: string }

function useCustomerForm(onSubmit: (d: CustomerFormData) => Promise<void>, onClose: () => void) {
  const [form, setForm] = useState<CustomerFormData>({ name: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await onSubmit(form); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Gagal menyimpan pelanggan') }
    finally { setLoading(false) }
  }
  return { form, setForm, loading, error, submit }
}

export function CustomerFormModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (d: CustomerFormData) => Promise<void> }) {
  const { form, setForm, loading, error, submit } = useCustomerForm(onSubmit, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Tambah Data Pelanggan</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Nama Pelanggan / Institusi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email Pelanggan" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Nomor Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Textarea label="Alamat Pengiriman / Penagihan" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan Pelanggan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

