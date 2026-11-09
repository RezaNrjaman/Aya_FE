/** UI-004: Shared API Client — base config, interceptors, token */
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/** Attach JWT token from sessionStorage on every request */
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


/**
 * A 401 on an authenticated request means the session is no longer valid
 * (token expired, account deactivated). Clear it and send the user to login.
 */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const hadToken = Boolean(error?.config?.headers?.Authorization)
    const isLogin = String(error?.config?.url ?? '').includes('/login')
    if (status === 401 && hadToken && !isLogin && sessionStorage.getItem('auth_token')) {
      sessionStorage.removeItem('auth_token')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1')
      }
    }
    return Promise.reject(error)
  },
)
