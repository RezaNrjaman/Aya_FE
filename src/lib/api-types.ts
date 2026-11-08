/** UI-004: Standard response types matching BE envelope */

export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ListResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ErrorResponse {
  success: false
  error: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string>
}

