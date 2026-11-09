/** UI-005: Auth context — session state & permission check */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthState, LoginRequest } from './types'
import { loginApi, fetchProfile } from './api'

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  hasPermission: (perm: string) => boolean
  /** Re-reads role & permissions from the backend (after access changes). */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Permissions can be changed by an administrator at any time; re-check periodically. */
const PROFILE_REFRESH_MS = 60_000

const SIGNED_OUT: AuthState = { user: null, token: null, isLoading: false, isAuthenticated: false }

function useProfileLoader(token: string | null) {
  const [state, setState] = useState<AuthState>({
    user: null, token, isLoading: true, isAuthenticated: false,
  })

  useEffect(() => {
    if (!token) { setState((s) => ({ ...s, isLoading: false })); return }
    fetchProfile()
      .then((user) => setState((s) => ({ ...s, user, isAuthenticated: true, isLoading: false })))
      .catch(() => {
        sessionStorage.removeItem('auth_token')
        setState(SIGNED_OUT)
      })
  }, [token])

  return { state, setState }
}

/** Keeps permissions in sync with the backend while the session is open. */
function useProfileSync(isAuthenticated: boolean, refresh: () => Promise<void>) {
  useEffect(() => {
    if (!isAuthenticated) return
    const onFocus = () => { void refresh() }
    window.addEventListener('focus', onFocus)
    const timer = window.setInterval(onFocus, PROFILE_REFRESH_MS)
    return () => { window.removeEventListener('focus', onFocus); window.clearInterval(timer) }
  }, [isAuthenticated, refresh])
}

function useAuthState() {
  const { state, setState } = useProfileLoader(sessionStorage.getItem('auth_token'))

  const login = useCallback(async (data: LoginRequest) => {
    const result = await loginApi(data)
    sessionStorage.setItem('auth_token', result.token)
    const profile = await fetchProfile().catch(() => result.user)
    setState({ user: profile, token: result.token, isLoading: false, isAuthenticated: true })
  }, [setState])

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token')
    setState(SIGNED_OUT)
  }, [setState])

  const refreshProfile = useCallback(async () => {
    if (!sessionStorage.getItem('auth_token')) return
    try {
      const user = await fetchProfile()
      setState((s) => ({ ...s, user, isAuthenticated: true }))
    } catch {
      // 401 = account deactivated or session invalid; other errors keep the session.
    }
  }, [setState])

  useProfileSync(state.isAuthenticated, refreshProfile)
  const hasPermission = useCallback((perm: string) => state.user?.permissions?.includes(perm) ?? false, [state.user])
  return { ...state, login, logout, hasPermission, refreshProfile }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthState()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
