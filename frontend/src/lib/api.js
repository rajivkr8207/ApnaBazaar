import axios from 'axios'
import { Backend_Api_Url } from '../config/config'

let store

export const injectStore = (_store) => {
  store = _store
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: Backend_Api_Url,
  timeout: 10_000,
  withCredentials: true,           // send cookies / JWT httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the token from Redux state on every request
api.interceptors.request.use(
  (config) => {
    const token = store?.getState()?.auth?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (import.meta.env.DEV) {
      console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Automatically logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`← ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      store?.dispatch({ type: 'auth/logout' })
    }
    return Promise.reject(error)
  }
)

export default api