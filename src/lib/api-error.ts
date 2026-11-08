/** UI-004: Error mapping — convert API/network errors to UI state */
import type { AxiosError } from 'axios'
import type { ErrorResponse } from './api-types'

export interface UiError {
  code: string
  message: string
  details?: Record<string, string>
}

const NETWORK_ERROR: UiError = {
  code: 'NETWORK_ERROR',
  message: 'Tidak dapat terhubung ke server.',
}

/** Parse Axios error into a consistent UiError */
export function parseApiError(err: unknown): UiError {
  const axErr = err as AxiosError<ErrorResponse>
  if (!axErr.response) return NETWORK_ERROR
  const body = axErr.response.data
  if (body?.error) {
    return {
      code: body.error.code,
      message: body.error.message,
      details: body.error.details,
    }
  }
  return mapHttpStatus(axErr.response.status)
}

function mapHttpStatus(status: number): UiError {
  if (status === 401) return { code: 'UNAUTHORIZED', message: 'Sesi telah berakhir.' }
  if (status === 403) return { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses.' }
  if (status === 404) return { code: 'NOT_FOUND', message: 'Data tidak ditemukan.' }
  if (status === 409) return { code: 'CONFLICT', message: 'Data sudah ada.' }
  if (status === 422) return { code: 'VALIDATION', message: 'Data tidak valid.' }
  return { code: 'SERVER_ERROR', message: 'Terjadi kesalahan server.' }
}

