/** M3: Partner Management API services */
import { apiClient } from '@/lib/api-client'
import type { SuccessResponse, ListResponse } from '@/lib/api-types'
import type {
  Partner,
  PartnerDetail,
  PublicPartnerStatus,
  ActivateAccountData,
  RegisterPartnerData,
} from './types'

export async function fetchPartners(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
}): Promise<ListResponse<Partner>> {
  const res = await apiClient.get<ListResponse<Partner>>('/m3/v1/partners', { params })
  return res.data
}

export async function getPartner(id: number): Promise<PartnerDetail> {
  const res = await apiClient.get<SuccessResponse<PartnerDetail>>(`/m3/v1/partners/${id}`)
  return res.data.data
}

export async function registerPartner(data: RegisterPartnerData): Promise<Partner> {
  const res = await apiClient.post<SuccessResponse<Partner>>('/m3/v1/partners/register', data)
  return res.data.data
}

export async function verifyPartner(
  id: number,
  action: 'approve' | 'reject',
  reason?: string,
): Promise<void> {
  await apiClient.post(`/m3/v1/partners/${id}/verify`, { action, reason })
}

export async function suspendPartner(id: number, reason: string): Promise<void> {
  await apiClient.post(`/m3/v1/partners/${id}/suspend`, { reason })
}

export async function reactivatePartner(id: number): Promise<void> {
  await apiClient.post(`/m3/v1/partners/${id}/reactivate`)
}

export async function fetchVerifiedPartners(): Promise<Partner[]> {
  const res = await apiClient.get<SuccessResponse<Partner[]>>('/m3/v1/partners/verified')
  return res.data.data
}

/**
 * Public status check by unguessable registration code (ARY-002).
 * The old `GET /partners/:id/status` sequential-ID endpoint was removed.
 */
export async function getPublicPartnerStatus(code: string): Promise<PublicPartnerStatus> {
  const res = await apiClient.get<SuccessResponse<PublicPartnerStatus>>('/m3/v1/partners/status', {
    params: { code },
  })
  return res.data.data
}

/** Consume the single-use activation invitation and set the first password. */
export async function activateAccount(data: ActivateAccountData): Promise<void> {
  await apiClient.post('/m1/v1/auth/activate', data)
}

