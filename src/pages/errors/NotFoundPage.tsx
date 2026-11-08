/** UI-005: Not Found page */
import { FileQuestion } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <FileQuestion size={48} className="text-dark-500" />
      <h2 className="font-heading text-xl font-bold text-dark-200">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-dark-400">Halaman yang Anda cari tidak ada.</p>
      <Button variant="secondary" onClick={() => navigate('/dashboard')}>
        Kembali ke Dashboard
      </Button>
    </div>
  )
}

