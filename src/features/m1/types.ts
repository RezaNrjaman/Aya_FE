/** M1: Auth & User Management types */

export interface User {
  id: number
  email: string
  name: string
  phone?: string
  division_id?: number
  division_name?: string
  role: string
  unit_usaha_id?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  phone?: string
  division_id?: number
  role?: string
  unit_usaha_id?: number
}

export interface UpdateUserData {
  name?: string
  phone?: string
  division_id?: number
  role?: string
  unit_usaha_id?: number
  is_active?: boolean
}

export interface AssignRoleData {
  role_name: string
  unit_usaha_id?: number
}

export interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  is_active: boolean
  permissions?: string[]
}

export interface CreateRoleData {
  name: string
  display_name: string
  description?: string
}

export interface Permission {
  key: string
  module: string
  name: string
  description?: string
  is_active: boolean
}

export interface AuditLog {
  id: number
  actor: string
  action: string
  object_type: string
  object_id: string
  details?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface ChangePasswordData {
  old_password: string
  new_password: string
}

