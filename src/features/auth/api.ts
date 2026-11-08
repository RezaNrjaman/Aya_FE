/** UI-005: Auth API calls */
import { apiClient } from '@/lib/api-client'
import type { SuccessResponse } from '@/lib/api-types'
import type { LoginRequest, LoginResponse, AuthUser } from './types'

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<SuccessResponse<LoginResponse>>(
    '/m1/v1/auth/login',
    data,
  )
  return res.data.data
}

export async function fetchProfile(): Promise<AuthUser> {
  const res = await apiClient.get<SuccessResponse<AuthUser>>(
    '/m1/v1/auth/me',
  )
  return res.data.data
}

