/** M2: Business Unit & Dashboard types */

export interface BusinessUnit {
  id: number
  name: string
  description?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  logo_url?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateUnitData {
  name: string
  description?: string
}

export interface UpdateUnitData {
  name?: string
  description?: string
}

export interface BusinessCategory {
  id: number
  partner_id?: number
  unit_usaha_id: number
  name: string
  description?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryData {
  unit_usaha_id: number
  name: string
  description?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
}

export interface Division {
  id: number
  unit_usaha_id: number
  category_id: number
  unit_name?: string
  category_name?: string
  name: string
  description?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateDivisionData {
  unit_usaha_id: number
  category_id: number
  name: string
  description?: string
}

export interface UpdateDivisionData {
  unit_usaha_id?: number
  category_id?: number
  name?: string
  description?: string
}

export interface DashboardMetrics {
  total_revenue: number
  total_orders: number
  active_partners: number
  active_products: number
  pending_verifications: number
}

export interface RecentOrder {
  order_no: string
  unit_name: string
  total_amount: number
  status: string
  created_at: string
}

export interface DashboardSummary {
  unit_usaha_id?: number
  period_from?: string
  period_to?: string
  metrics: DashboardMetrics
  recent_orders: RecentOrder[]
}

