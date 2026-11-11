/** M4: Transaction Management API services */
import { apiClient } from '@/lib/api-client'
import type { SuccessResponse, ListResponse } from '@/lib/api-types'
import type {
  Product,
  CreateProductData,
  Customer,
  Quotation,
  Invoice,
  Order,
} from './types'

export async function fetchAdminProducts(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<Product>> {
  const res = await apiClient.get<ListResponse<Product>>('/m4/v1/admin/products', { params })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  const res = await apiClient.post<SuccessResponse<Product>>('/m4/v1/products', data)
  return res.data.data
}

export async function updateProduct(id: number, data: Partial<CreateProductData> & { is_active?: boolean }): Promise<Product> {
  const res = await apiClient.patch<SuccessResponse<Product>>(`/m4/v1/products/${id}`, data)
  return res.data.data
}

export async function fetchCustomers(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<Customer>> {
  const res = await apiClient.get<ListResponse<Customer>>('/m4/v1/customers', { params })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function createCustomer(data: { name: string; email: string; phone?: string; address?: string }): Promise<Customer> {
  const res = await apiClient.post<SuccessResponse<Customer>>('/m4/v1/customers', data)
  return res.data.data
}

export async function fetchQuotations(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<Quotation>> {
  const res = await apiClient.get<ListResponse<Quotation>>('/m4/v1/quotations', { params })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function getQuotation(id: number): Promise<Quotation> {
  const res = await apiClient.get<SuccessResponse<Quotation>>(`/m4/v1/quotations/${id}`)
  return res.data.data
}

export async function createQuotation(data: {
  unit_usaha_id: number
  customer_id: number
  items: { item_name: string; quantity: number; unit_price: number }[]
}): Promise<Quotation> {
  const res = await apiClient.post<SuccessResponse<Quotation>>('/m4/v1/quotations', data)
  return res.data.data
}

export async function approveQuotation(id: number): Promise<void> {
  await apiClient.post(`/m4/v1/quotations/${id}/approve`)
}

export async function rejectQuotation(id: number): Promise<void> {
  await apiClient.post(`/m4/v1/quotations/${id}/reject`)
}

export async function fetchInvoices(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<Invoice>> {
  const res = await apiClient.get<ListResponse<Invoice>>('/m4/v1/invoices', { params })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function getInvoice(id: number): Promise<Invoice> {
  const res = await apiClient.get<SuccessResponse<Invoice>>(`/m4/v1/invoices/${id}`)
  return res.data.data
}

export async function createInvoice(data: {
  quotation_id?: number
  customer_id: number
  items?: { item_name: string; quantity: number; unit_price: number }[]
}): Promise<Invoice> {
  const res = await apiClient.post<SuccessResponse<Invoice>>('/m4/v1/invoices', data)
  return res.data.data
}

export async function payInvoice(
  id: number,
  data: { method: string; amount: number; simulate_failure?: boolean },
): Promise<void> {
  await apiClient.post(`/m4/v1/invoices/${id}/pay`, data)
}

export async function fetchAdminOrders(params?: {
  page?: number
  per_page?: number
  search?: string
}): Promise<ListResponse<Order>> {
  const res = await apiClient.get<ListResponse<Order>>('/m4/v1/admin/orders', { params })
  return { ...res.data, data: Array.isArray(res.data?.data) ? res.data.data : [] }
}

export async function getOrder(id: number): Promise<Order> {
  const res = await apiClient.get<SuccessResponse<Order>>(`/m4/v1/orders/${id}`)
  return res.data.data
}

export async function processOrder(id: number): Promise<void> {
  await apiClient.post(`/m4/v1/orders/${id}/process`)
}

export async function completeOrder(id: number): Promise<void> {
  await apiClient.post(`/m4/v1/orders/${id}/complete`)
}

export async function cancelOrder(id: number): Promise<void> {
  await apiClient.post(`/m4/v1/orders/${id}/cancel`)
}

export async function createOrder(data: {
  customer_id: number
  idempotency_key?: string
  items: { product_id: number; quantity: number }[]
}): Promise<Order> {
  const res = await apiClient.post<SuccessResponse<Order>>('/m4/v1/partner/orders', data)
  return res.data.data
}

