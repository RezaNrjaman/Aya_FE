/** M5: Customer Portal & E-Commerce API Client */
import { apiClient } from '@/lib/api-client'
import type { SuccessResponse, ListResponse } from '@/lib/api-types'
import type { Invoice } from '@/features/m4/types'
import type { PublicOrder } from './types'
import type {
  BusinessUnitSummary,
  ProductSummary,
  Cart,
  CreateServiceRequestData,
  ServiceRequest,
  CheckoutData,
  CheckoutResult,
  CatalogFilterParams,
} from './types'

export function getCartSessionId(): string {
  const KEY = 'araya_cart_session'
  let sid = localStorage.getItem(KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem(KEY, sid)
  }
  return sid
}

function getCartConfig() {
  return { headers: { 'X-Session-ID': getCartSessionId() } }
}

export async function fetchPublicBusinessUnits(): Promise<BusinessUnitSummary[]> {
  const res = await apiClient.get<{ data: BusinessUnitSummary[] }>('/m5/v1/business-units')
  return Array.isArray(res.data?.data) ? res.data.data : []
}

export async function fetchPublicProducts(params?: CatalogFilterParams): Promise<ProductSummary[]> {
  const res = await apiClient.get<{ data: ProductSummary[] }>('/m5/v1/products', { params })
  return Array.isArray(res.data?.data) ? res.data.data : []
}

export async function fetchCart(): Promise<Cart> {
  const res = await apiClient.get<{ data: Cart }>('/m5/v1/cart', getCartConfig())
  const cart = res.data?.data
  return { ...(cart ?? {}), items: Array.isArray(cart?.items) ? cart.items : [], total_amount: cart?.total_amount ?? 0, total_items: cart?.total_items ?? 0 } as Cart
}

function normalizeCartPayload(value: Cart | null | undefined): Cart {
  const cart = value ?? ({} as Cart)
  return { ...cart, items: Array.isArray(cart.items) ? cart.items : [], total_amount: cart.total_amount ?? 0, total_items: cart.total_items ?? 0 }
}

export async function addToCart(productId: number, quantity = 1): Promise<Cart> {
  const res = await apiClient.post<{ data: Cart }>('/m5/v1/cart/items', { product_id: productId, quantity }, getCartConfig())
  return normalizeCartPayload(res.data?.data)
}

export async function updateCartItem(productId: number, quantity: number): Promise<Cart> {
  const res = await apiClient.patch<{ data: Cart }>(`/m5/v1/cart/items/${productId}`, { quantity }, getCartConfig())
  return normalizeCartPayload(res.data?.data)
}

export async function removeCartItem(productId: number): Promise<Cart> {
  const res = await apiClient.delete<{ data: Cart }>(`/m5/v1/cart/items/${productId}`, getCartConfig())
  return normalizeCartPayload(res.data?.data)
}

export async function clearCart(): Promise<void> {
  await apiClient.delete('/m5/v1/cart', getCartConfig())
}

export async function checkoutCart(data: CheckoutData): Promise<CheckoutResult> {
  const res = await apiClient.post<{ data: CheckoutResult }>('/m5/v1/cart/checkout', data, getCartConfig())
  return res.data.data
}

export async function createServiceRequest(data: CreateServiceRequestData): Promise<ServiceRequest> {
  const res = await apiClient.post<SuccessResponse<ServiceRequest>>('/m5/v1/service-requests', data)
  return res.data.data
}

export async function fetchServiceRequests(params?: {
  page?: number
  per_page?: number
  unit_usaha_id?: number
  status?: string
}): Promise<ListResponse<ServiceRequest>> {
  const res = await apiClient.get<ListResponse<ServiceRequest>>('/m5/v1/admin/service-requests', { params })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function updateServiceRequestStatus(id: number, status: 'diproses' | 'selesai'): Promise<ServiceRequest> {
  const res = await apiClient.patch<SuccessResponse<ServiceRequest>>(`/m5/v1/admin/service-requests/${id}/status`, { status })
  return res.data.data
}



export interface PublicOrderTracking {
  order: PublicOrder
  invoice: Invoice | null
}

export async function trackPublicOrder(orderNo: string, email: string): Promise<PublicOrderTracking> {
  const res = await apiClient.post<{ data: PublicOrderTracking }>('/m4/v1/public/orders/track', {
    order_no: orderNo, customer_email: email,
  })
  return res.data.data
}

export async function payPublicOrder(orderNo: string, email: string, method: string): Promise<void> {
  await apiClient.post(`/m4/v1/public/orders/${encodeURIComponent(orderNo)}/pay`, {
    customer_email: email, method,
  })
}
