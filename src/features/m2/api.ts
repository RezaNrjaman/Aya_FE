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
  BusinessCategory,
  CreateCategoryData,
  UpdateCategoryData,
} from './types'

export async function fetchAdminUnits(params?: {
  page?: number
  per_page?: number
  search?: string
  category?: string
  active_only?: boolean
}): Promise<ListResponse<BusinessUnit>> {
  const safeParams = { ...params, per_page: Math.min(params?.per_page ?? 20, 100) }
  const res = await apiClient.get<ListResponse<BusinessUnit>>(
    '/m2/v1/admin/business-units',
    { params: safeParams },
  )
  // Some older API responses return data: null when a tenant has no units.
  // Keep list contracts stable so pages can safely call .map().
  return {
    ...res.data,
    data: Array.isArray(res.data?.data) ? res.data.data : [],
  }
}


export async function fetchTenantUnits(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<BusinessUnit>> {
  const safeParams = { ...params, per_page: Math.min(params?.per_page ?? 20, 100) }
  const res = await apiClient.get<ListResponse<BusinessUnit>>('/m2/v1/admin/business-units', { params: safeParams })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function fetchActiveUnits(): Promise<BusinessUnit[]> {
  const res = await apiClient.get<SuccessResponse<BusinessUnit[]>>(
    '/m2/v1/business-units',
  )
  return Array.isArray(res.data?.data) ? res.data.data : []
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
  const safeParams = { ...params, per_page: Math.min(params?.per_page ?? 20, 100) }
  const res = await apiClient.get<ListResponse<Division>>('/m2/v1/divisions', {
    params: safeParams,
  })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
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



export async function fetchCategories(params?: {
  unit_usaha_id?: number
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<BusinessCategory>> {
  const safeParams = { ...params, per_page: Math.min(params?.per_page ?? 20, 100) }
  const res = await apiClient.get<ListResponse<BusinessCategory>>('/m2/v1/categories', { params: safeParams })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function createCategory(data: CreateCategoryData): Promise<BusinessCategory> {
  const res = await apiClient.post<SuccessResponse<BusinessCategory>>('/m2/v1/categories', data)
  return res.data.data
}

export async function updateCategory(id: number, data: UpdateCategoryData): Promise<BusinessCategory> {
  const res = await apiClient.patch<SuccessResponse<BusinessCategory>>(`/m2/v1/categories/${id}`, data)
  return res.data.data
}

export async function deactivateCategory(id: number): Promise<void> {
  await apiClient.post(`/m2/v1/categories/${id}/deactivate`)
}

export async function activateCategory(id: number): Promise<void> {
  await apiClient.post(`/m2/v1/categories/${id}/activate`)
}


/** Fetch every page without exceeding the API's 100-row page limit. */
async function fetchAllPages<T>(fetchPage: (page: number) => Promise<ListResponse<T>>): Promise<T[]> {
  const first = await fetchPage(1)
  const result = [...(first.data ?? [])]
  const totalPages = Math.max(1, first.meta?.total_pages ?? 1)
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPage(page)
    result.push(...(next.data ?? []))
  }
  return result
}

export function fetchAllTenantUnits(): Promise<BusinessUnit[]> {
  return fetchAllPages((page) => fetchTenantUnits({ page, per_page: 100 }))
}

export function fetchAllCategories(unit_usaha_id?: number): Promise<BusinessCategory[]> {
  return fetchAllPages((page) => fetchCategories({ page, per_page: 100, unit_usaha_id }))
}

export function fetchAllDivisions(): Promise<Division[]> {
  return fetchAllPages((page) => fetchDivisions({ page, per_page: 100 }))
}
