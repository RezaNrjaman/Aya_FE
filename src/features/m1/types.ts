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
  partner_id?: number
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
  /** Backend returns full permission objects from GET /m1/v1/roles. */
  permissions?: Permission[]
}

export interface CreateRoleData {
  name: string
  display_name: string
  description?: string
  /** Optional initial permission set (e.g. copied from another role). */
  permission_keys?: string[]
}

export interface UpdateRoleData {
  display_name?: string
  description?: string
  is_active?: boolean
}

export interface Permission {
  id?: number
  key: string
  module: string
  name: string
  description?: string
  is_active?: boolean
  created_at?: string
}

export interface AuditLog {
  id: number
  user_id?: number
  user_name?: string
  action: string
  entity_type: string
  entity_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  request_id?: string
  created_at: string
}

export interface ChangePasswordData {
  old_password: string
  new_password: string
}

