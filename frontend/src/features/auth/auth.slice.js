import { createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, verifyOtp, logoutUser, fetchProfile, updateProfile } from './auth.thunk'

// Helper to reliably extract the user object from backend response envelopes
const extractUser = (payload) => {
  if (!payload) return null
  if (payload.data?.user) return payload.data.user
  if (payload.user) return payload.user
  if (payload.data && (payload.data._id || payload.data.email || payload.data.username || payload.data.fullName)) {
    return payload.data
  }
  return payload.data || null
}

const initialState = {
  user: null, // { _id, fullName, username, email, role, avatar, ... }
  token: null,
  isAuthenticated: false,
  isInitialized: false, // true once initial profile check on page refresh finishes
  loading: false,
  error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isInitialized = true
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    // ── Register ─────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Login ─────────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user = extractUser(payload)
        state.token = payload?.data?.accessToken || payload?.accessToken || state.token
        state.isAuthenticated = true
        state.isInitialized = true
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Verify OTP ────────────────────────────────────────────────────────────
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user = extractUser(payload)
        state.token = payload?.data?.accessToken || payload?.accessToken || state.token
        state.isAuthenticated = true
        state.isInitialized = true
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Logout ────────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
      })

    // ── Fetch Profile (used on page refresh to verify existing session) ───────
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.loading = false
        const user = extractUser(payload)
        state.user = user
        state.isAuthenticated = !!user
        state.isInitialized = true
      })
      .addCase(fetchProfile.rejected, (state, { payload }) => {
        state.loading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
        state.error = payload
      })

    // ── Update Profile ────────────────────────────────────────────────────────
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user = extractUser(payload) || state.user
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  },
})

export const { logout, clearError, setOtpEmail } = authSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsInitialized = (state) => state.auth.isInitialized
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
