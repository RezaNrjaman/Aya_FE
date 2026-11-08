/** Login page */
import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

export function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, submit } = useLoginForm()
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl font-bold text-brand-400">Araya Hub</h2>
        <p className="text-sm text-dark-400 mt-1">Masuk ke akun Anda</p>
      </div>
      {error && <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{error}</div>}
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" loading={loading} className="w-full">Masuk</Button>
    </form>
  )
}
