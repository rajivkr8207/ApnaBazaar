import api from '../../../lib/api'

// ─── Auth Service ─────────────────────────────────────────────────────────────
// All functions return the raw axios response so the slice can handle data/error.

/**
 * POST /auth/register
 * Body: { name, email, password, role }
 */
const register = (formData) => api.post('/auth/register', formData)

/**
 * POST /auth/login
 * Body: { email, password }
 */
const login = (credentials) => api.post('/auth/login', credentials)

/**
 * POST /auth/verify-otp
 * Body: { email, otp }
 */
const verifyOtp = ({ email, otp }) => api.post(`/auth/verify-otp?email=${email}`, { otp })

/**
 * POST /auth/resend-otp
 * Body: { email }
 */
const resendOtp = (email) => api.post('/auth/resend-otp', { email })

/**
 * POST /auth/logout
 */
const logout = () => api.post('/auth/logout')

/**
 * GET /auth/profile  (requires auth token)
 */
const getProfile = () => api.get('/auth/profile')

/**
 * PUT /auth/profile  (requires auth token)
 * Body: FormData or JSON { name, avatar, ... }
 */
const updateProfile = (formData) => api.put('/auth/profile', formData, {
  headers: formData instanceof FormData
    ? { 'Content-Type': 'multipart/form-data' }
    : {},
})

const authService = { register, login, verifyOtp, resendOtp, logout, getProfile, updateProfile }
export default authService          