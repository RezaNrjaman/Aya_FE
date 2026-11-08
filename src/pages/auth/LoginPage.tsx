/** Login page */
import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { parseApiError } from '@/lib/api-error'
import { Button, Input } from '@/components/ui'

function useLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setLoading(false)
    }
  }
  return { email, setEmail, password, setPassword, error, loading, submit }
}

function DemoAccountButtons({ onSelect }: { onSelect: (e: string, p: string) => void }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1.5">
      <p className="text-dark-400 font-medium">Akun Demo Cepat:</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSelect('admin@araya.com', 'Admin1234!')}
          className="px-2 py-1 bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 rounded"
        >
          Super Admin
        </button>
        <button
          type="button"
          onClick={() => onSelect('budi@mitragrafika.com', 'Partner123!')}
          className="px-2 py-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded"
        >
          Partner Mitra
        </button>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, submit } = useLoginForm()
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="font-heading text-2xl font-bold text-brand-400">Araya Hub</h2>
        <p className="text-sm text-dark-400 mt-1">Masuk ke akun Anda</p>
      </div>
      {error && <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{error}</div>}
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <DemoAccountButtons onSelect={(e, p) => { setEmail(e); setPassword(p); }} />
      <Button type="submit" loading={loading} className="w-full">Masuk</Button>
      <div className="pt-2 text-center text-xs space-y-2 text-dark-400 border-t border-glass-border/40">
        <p>Mitra Bisnis Baru? <Link to="/partner/register" className="text-brand-400 hover:underline">Daftar Mandiri</Link> • <Link to="/partner/status" className="text-brand-400 hover:underline">Cek Status</Link></p>
        <p><Link to="/catalog" className="text-dark-500 hover:text-dark-300">← Kembali ke Portal Katalog</Link></p>
      </div>
    </form>
  )
}
