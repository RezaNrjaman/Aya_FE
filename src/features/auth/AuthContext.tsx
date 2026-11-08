/** UI-005: Auth context — session state & permission check */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthState, LoginRequest } from './types'
import { loginApi, fetchProfile } from './api'

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  hasPermission: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

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
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false })
      })
  }, [token])

  return { state, setState }
}

function useAuthState() {
  const { state, setState } = useProfileLoader(sessionStorage.getItem('auth_token'))

  const login = useCallback(async (data: LoginRequest) => {
    const result = await loginApi(data)
    sessionStorage.setItem('auth_token', result.token)
    setState({ user: result.user, token: result.token, isLoading: false, isAuthenticated: true })
  }, [setState])

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token')
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false })
  }, [setState])

  const hasPermission = useCallback((perm: string) => state.user?.permissions.includes(perm) ?? false, [state.user])
  return { ...state, login, logout, hasPermission }
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
