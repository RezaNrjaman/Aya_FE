/** UI-005: Forbidden page */
import { ShieldOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <ShieldOff size={48} className="text-danger" />
      <h2 className="font-heading text-xl font-bold text-dark-200">Akses Ditolak</h2>
      <p className="text-sm text-dark-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Button variant="secondary" onClick={() => navigate('/dashboard')}>
        Kembali ke Dashboard
      </Button>
    </div>
  )
}

