/** M1: Auth & User Management API services */
import { apiClient } from '@/lib/api-client'
import type { SuccessResponse, ListResponse } from '@/lib/api-types'
import type {
  User,
  CreateUserData,
  UpdateUserData,
  AssignRoleData,
  Role,
  CreateRoleData,
  UpdateRoleData,
  AuditLog,
  ChangePasswordData,
} from './types'

export async function fetchUsers(params?: {
  page?: number
  per_page?: number
  search?: string
  division?: string
}): Promise<ListResponse<User>> {
  const res = await apiClient.get<ListResponse<User>>('/m1/v1/users', { params })
  return { ...res.data, data: res.data.data ?? [] }
}

export async function createUser(data: CreateUserData): Promise<User> {
  const res = await apiClient.post<SuccessResponse<User>>('/m1/v1/users', data)
  return res.data.data
}

export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  const res = await apiClient.patch<SuccessResponse<User>>(`/m1/v1/users/${id}`, data)
  return res.data.data
}

export async function deactivateUser(id: number): Promise<void> {
  await apiClient.delete(`/m1/v1/users/${id}`)
}

export async function assignUserRole(id: number, data: AssignRoleData): Promise<void> {
  await apiClient.post(`/m1/v1/users/${id}/roles`, data)
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await apiClient.get<SuccessResponse<Role[]>>('/m1/v1/roles')
  return res.data.data ?? []
}

export async function createRole(data: CreateRoleData): Promise<void> {
  await apiClient.post('/m1/v1/roles', data)
}

export async function updateRole(roleName: string, data: UpdateRoleData): Promise<void> {
  await apiClient.patch(`/m1/v1/roles/${encodeURIComponent(roleName)}`, data)
}

/** Replaces the full permission set of a role (permission matrix save). */
export async function setRolePermissions(roleName: string, permissionKeys: string[]): Promise<Role> {
  const res = await apiClient.put<SuccessResponse<Role>>(
    `/m1/v1/roles/${encodeURIComponent(roleName)}/permissions`,
    { permission_keys: permissionKeys },
  )
  return res.data.data
}

export async function assignRolePermission(
  roleName: string,
  permissionKey: string,
): Promise<void> {
  await apiClient.post(`/m1/v1/roles/${roleName}/permissions`, {
    permission_key: permissionKey,
  })
}

export async function revokeRolePermission(
  roleName: string,
  permissionKey: string,
): Promise<void> {
  await apiClient.delete(`/m1/v1/roles/${roleName}/permissions/${permissionKey}`)
}

export async function fetchAuditLogs(params?: {
  page?: number
  per_page?: number
}): Promise<ListResponse<AuditLog>> {
  const res = await apiClient.get<ListResponse<AuditLog>>('/m1/v1/audit-logs', { params })
  return res.data
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await apiClient.patch('/m1/v1/password', data)
}

export interface PermissionDefinition {
  key: string
  module: string
  name: string
  description: string
  is_active: boolean
}

export async function fetchAvailablePermissions(): Promise<PermissionDefinition[]> {
  const res = await apiClient.get<SuccessResponse<PermissionDefinition[]>>('/m1/v1/roles/permissions')
  return res.data.data ?? []
}

