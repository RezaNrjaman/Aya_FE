/** UI-003: ConfirmDialog — modal confirmation */
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Konfirmasi', confirmVariant = 'primary', loading, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60">
      <div className="glass-card w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-dark-100">{title}</h3>
        <p className="text-sm text-dark-300">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="tertiary" onClick={onCancel} disabled={loading}>Batal</Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
