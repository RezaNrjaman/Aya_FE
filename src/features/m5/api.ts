/** M5: Customer Portal & E-Commerce API Client */
import { apiClient } from '@/lib/api-client'
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
    sid = 'sess_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    localStorage.setItem(KEY, sid)
  }
  return sid
}

function getCartConfig() {
  return { headers: { 'X-Session-ID': getCartSessionId() } }
}

export async function fetchPublicBusinessUnits(): Promise<BusinessUnitSummary[]> {
  const res = await apiClient.get<{ data: BusinessUnitSummary[] }>('/m5/v1/business-units')
  return res.data.data
}

export async function fetchPublicProducts(params?: CatalogFilterParams): Promise<ProductSummary[]> {
  const res = await apiClient.get<{ data: ProductSummary[] }>('/m5/v1/products', { params })
  return res.data.data
}

export async function fetchCart(): Promise<Cart> {
  const res = await apiClient.get<{ data: Cart }>('/m5/v1/cart', getCartConfig())
  return res.data.data
}

export async function addToCart(productId: number, quantity = 1): Promise<Cart> {
  const res = await apiClient.post<{ data: Cart }>('/m5/v1/cart/items', { product_id: productId, quantity }, getCartConfig())
  return res.data.data
}

export async function updateCartItem(productId: number, quantity: number): Promise<Cart> {
  const res = await apiClient.patch<{ data: Cart }>(`/m5/v1/cart/items/${productId}`, { quantity }, getCartConfig())
  return res.data.data
}

export async function removeCartItem(productId: number): Promise<Cart> {
  const res = await apiClient.delete<{ data: Cart }>(`/m5/v1/cart/items/${productId}`, getCartConfig())
  return res.data.data
}

export async function clearCart(): Promise<void> {
  await apiClient.delete('/m5/v1/cart', getCartConfig())
}

export async function checkoutCart(data: CheckoutData): Promise<CheckoutResult> {
  const res = await apiClient.post<{ data: CheckoutResult }>('/m5/v1/cart/checkout', data, getCartConfig())
  return res.data.data
}

export async function createServiceRequest(data: CreateServiceRequestData): Promise<ServiceRequest> {
  const res = await apiClient.post<{ data: ServiceRequest }>('/m5/v1/service-requests', data)
  return res.data.data
}

