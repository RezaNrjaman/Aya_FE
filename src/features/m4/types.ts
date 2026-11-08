/** M4: Transaction Management types */

export interface Product {
  id: number
  unit_usaha_id: number
  partner_id?: number
  name: string
  category?: string
  description?: string
  price: number
  stock: number
  is_active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  unit_usaha_id: number
  partner_id?: number
  name: string
  category?: string
  description?: string
  price: number
  stock: number
  image_url?: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id?: number
  product_id?: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Quotation {
  id: number
  quotation_no: string
  unit_usaha_id: number
  partner_id?: number
  customer_id: number
  total_amount: number
  status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak'
  valid_until?: string
  items?: QuotationItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id?: number
  product_id?: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Invoice {
  id: number
  invoice_no: string
  quotation_id?: number
  customer_id: number
  total_amount: number
  status: 'belum_lunas' | 'lunas' | 'dibatalkan'
  due_date?: string
  paid_at?: string
  items?: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface OrderStatusHistory {
  id: number
  order_id: number
  from_status: string
  to_status: string
  reason?: string
  changed_by?: string
  created_at: string
}

export interface Order {
  id: number
  order_no: string
  customer_id: number
  invoice_id?: number
  total_amount: number
  status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan'
  idempotency_key?: string
  items?: OrderItem[]
  histories?: OrderStatusHistory[]
  created_at: string
  updated_at: string
}

