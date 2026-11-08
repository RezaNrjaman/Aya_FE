/** UI-005: Auth types — user, session, permission */

export interface AuthUser {
  id: string
  email: string
  name: string
  is_active: boolean
  roles: UserRole[]
  permissions: string[]
}

export interface UserRole {
  role_id: string
  role_name: string
  scope_type?: string
  scope_id?: string
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

