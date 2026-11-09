/** UI-005: Auth types — user, session, permission */

export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
  division?: string
  unit_usaha_id?: number
  /** Present when the account belongs to a partner organisation. */
  partner_id?: number
  permissions: string[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}
