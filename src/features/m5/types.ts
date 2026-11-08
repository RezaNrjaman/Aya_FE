/** M5: Customer Portal & E-Commerce Type Definitions */

export interface BusinessUnitSummary {
  id: number
  name: string
  category: string
  description?: string
  logo_url?: string
}

export interface ProductSummary {
  id: number
  unit_usaha_id: number
  name: string
  category: string
  price: number
  stock: number
  is_active: boolean
}

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Cart {
  id: number
  session_id: string
  total_items: number
  total_amount: number
  items: CartItem[]
}

export interface CreateServiceRequestData {
  unit_usaha_id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  service_type?: string
  description: string
}

export interface ServiceRequest {
  id: number
  unit_usaha_id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  service_type?: string
  description: string
  status: string
  created_at: string
}

export interface CheckoutData {
  customer_id: number
  idempotency_key?: string
  notes?: string
}

export interface CheckoutResult {
  order_id: number
  order_no: string
  total_amount: number
  status: string
  cart_cleared: boolean
  idempotency_key?: string
}

export interface CatalogFilterParams {
  unit_usaha_id?: number
  category?: string
  search?: string
}

