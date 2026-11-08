import { useState, type FormEvent } from 'react'
import { Button, Input, useToast } from '@/components/ui'
import { changePassword } from '@/features/m1/api'
import { parseApiError } from '@/lib/api-error'

function useChangePassword(onClose: () => void) {
  const { toast } = useToast()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) { setError('Konfirmasi password tidak cocok'); return }
    setLoading(true)
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword })
      toast('success', 'Password berhasil diubah')
      onClose()
    } catch (err: unknown) {
      setError(parseApiError(err).message)
    } finally {
      setLoading(false)
    }
  }
  return { oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, loading, error, submit }
}

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { oldPassword, setOldPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, loading, error, submit } = useChangePassword(onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">Ubah Password Akun</h3>
        {error && <div className="text-xs text-danger bg-danger/10 p-2 rounded">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Input label="Password Saat Ini" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          <Input label="Password Baru" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Konfirmasi Password Baru" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="tertiary" type="button" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan Password</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
