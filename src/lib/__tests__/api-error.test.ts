import { describe, it, expect } from 'vitest'
import { parseApiError } from '../api-error'

describe('parseApiError', () => {
  it('should map network error when there is no response', () => {
    const error = new Error('Network error')
    const result = parseApiError(error)
    expect(result.code).toBe('NETWORK_ERROR')
    expect(result.message).toContain('Tidak dapat terhubung')
  })

  it('should extract structured error from response body', () => {
    const error = {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Email tidak valid',
            details: { email: 'format email salah' },
          },
        },
      },
    }
    const result = parseApiError(error)
    expect(result.code).toBe('VALIDATION_FAILED')
    expect(result.message).toBe('Email tidak valid')
    expect(result.details?.email).toBe('format email salah')
  })

  it('should fallback to HTTP 401 UNAUTHORIZED message', () => {
    const error = {
      response: {
        status: 401,
        data: {},
      },
    }
    const result = parseApiError(error)
    expect(result.code).toBe('UNAUTHORIZED')
    expect(result.message).toContain('Sesi telah berakhir')
  })

  it('should fallback to HTTP 403 FORBIDDEN message', () => {
    const error = {
      response: {
        status: 403,
        data: {},
      },
    }
    const result = parseApiError(error)
    expect(result.code).toBe('FORBIDDEN')
    expect(result.message).toContain('tidak memiliki akses')
  })

  it('should fallback to HTTP 404 NOT_FOUND message', () => {
    const error = {
      response: {
        status: 404,
        data: {},
      },
    }
    const result = parseApiError(error)
    expect(result.code).toBe('NOT_FOUND')
  })

  it('should fallback to HTTP 500 SERVER_ERROR message', () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
    }
    const result = parseApiError(error)
    expect(result.code).toBe('SERVER_ERROR')
  })
})

