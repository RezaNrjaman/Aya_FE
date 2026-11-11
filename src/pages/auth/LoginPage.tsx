/** Login page */
import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { parseApiError } from '@/lib/api-error'
import { Button, Input } from '@/components/ui'
import { getNavGroups } from '@/components/layout/nav-items'
function useLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      // Login resolves to the first permitted page. The role is read from the
      // refreshed profile after login, never from an untrusted form field.
      const { fetchProfile } = await import('@/features/auth/api')
      const profile = await fetchProfile()
      const role = String(profile.role || '').toLowerCase()
      const isPlatform = role === 'admin' || role === 'super_admin'
      const groups = getNavGroups(isPlatform)
      let landing = ''
      if (role === 'partner' && profile.permissions?.includes('m2.dashboard.read')) {
        landing = '/dashboard'
      } else {
        // Every non-owner role starts at the first permitted operational menu.
        for (const group of groups) {
          const allowed = group.items.find((item) =>
            item.path !== '/dashboard' &&
            (!item.permission || profile.permissions?.includes(item.permission))
          )
          if (allowed) { landing = allowed.path; break }
        }
      }
      navigate(landing || '/forbidden', { replace: true })
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
  const [params] = useSearchParams()
  const [sessionNotice, setSessionNotice] = useState('')
  useEffect(() => {
    // Set by api-client when a 401 hits mid-session (token expired or the
    // account was deactivated) — ARY-003: keep the user informed.
    if (params.get('expired') === '1') setSessionNotice('Sesi Anda telah berakhir atau akun dinonaktifkan. Silakan masuk kembali.')
  }, [params])
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="font-heading text-2xl font-bold text-brand-400">Araya Hub</h2>
        <p className="text-sm text-dark-400 mt-1">Masuk ke akun Anda</p>
      </div>
      {sessionNotice && !error && <div className="rounded-lg bg-brand/10 border border-brand/30 px-4 py-3 text-sm text-brand-300">{sessionNotice}</div>}
      {error && <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{error}</div>}
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" loading={loading} className="w-full">Masuk</Button>
      <div className="pt-2 text-center text-xs space-y-2 text-dark-400 border-t border-glass-border/40">
        <p>Mitra Bisnis Baru? <Link to="/partner/register" className="text-brand-400 hover:underline">Daftar Mandiri</Link> • <Link to="/partner/status" className="text-brand-400 hover:underline">Cek Status</Link></p>
        <p><Link to="/catalog" className="text-dark-500 hover:text-dark-300">← Kembali ke Portal Katalog</Link></p>
      </div>
    </form>
  )
}
