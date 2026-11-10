/** M2: Business Unit & Dashboard API services */
import { apiClient } from '@/lib/api-client'
import type { SuccessResponse, ListResponse } from '@/lib/api-types'
import type {
  BusinessUnit,
  CreateUnitData,
  UpdateUnitData,
  DashboardSummary,
  Division,
  CreateDivisionData,
  UpdateDivisionData,
} from './types'

export async function fetchAdminUnits(params?: {
  page?: number
  per_page?: number
  search?: string
  category?: string
  active_only?: boolean
}): Promise<ListResponse<BusinessUnit>> {
  const res = await apiClient.get<ListResponse<BusinessUnit>>(
    '/m2/v1/admin/business-units',
    { params },
  )
  return res.data
}

export async function fetchActiveUnits(): Promise<BusinessUnit[]> {
  const res = await apiClient.get<SuccessResponse<BusinessUnit[]>>(
    '/m2/v1/business-units',
  )
  return res.data.data
}

export async function createUnit(data: CreateUnitData): Promise<BusinessUnit> {
  const res = await apiClient.post<SuccessResponse<BusinessUnit>>(
    '/m2/v1/business-units',
    data,
  )
  return res.data.data
}

export async function updateUnit(
  id: number,
  data: UpdateUnitData,
): Promise<BusinessUnit> {
  const res = await apiClient.patch<SuccessResponse<BusinessUnit>>(
    `/m2/v1/business-units/${id}`,
    data,
  )
  return res.data.data
}

export async function deactivateUnit(id: number): Promise<void> {
  await apiClient.post(`/m2/v1/business-units/${id}/deactivate`)
}

export async function activateUnit(id: number): Promise<void> {
  await apiClient.post(`/m2/v1/business-units/${id}/activate`)
}

export async function fetchDashboardSummary(params?: {
  from?: string
  to?: string
  unit_usaha_id?: number
}): Promise<DashboardSummary> {
  const res = await apiClient.get<SuccessResponse<DashboardSummary>>(
    '/m2/v1/dashboard-summary',
    { params },
  )
  return res.data.data
}

/** ARY-006: partner-owned division CRUD */
export async function fetchDivisions(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<Division>> {
  const res = await apiClient.get<ListResponse<Division>>('/m2/v1/divisions', {
    params,
  })
  return res.data
}

export async function createDivision(data: CreateDivisionData): Promise<Division> {
  const res = await apiClient.post<SuccessResponse<Division>>(
    '/m2/v1/divisions',
    data,
  )
  return res.data.data
}

export async function updateDivision(
  id: number,
  data: UpdateDivisionData,
): Promise<Division> {
  const res = await apiClient.patch<SuccessResponse<Division>>(
    `/m2/v1/divisions/${id}`,
    data,
  )
  return res.data.data
}

export async function deactivateDivision(id: number): Promise<void> {
  await apiClient.post(`/m2/v1/divisions/${id}/deactivate`)
}

export async function activateDivision(id: number): Promise<void> {
  await apiClient.post(`/m2/v1/divisions/${id}/activate`)
}

export async function deleteDivision(id: number): Promise<void> {
  await apiClient.delete(`/m2/v1/divisions/${id}`)
}

