import { createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, verifyOtp, logoutUser, fetchProfile, updateProfile } from './auth.thunk'


const initialState = {
  user: null,   // { _id, name, email, role, avatar, ... }
  isAuthenticated: false,
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
      state.isAuthenticated = false
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
      .addCase(registerUser.fulfilled, (state, { payload }) => {
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
        state.user = payload.user
        state.isAuthenticated = true
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
        state.user = payload.user
        state.isAuthenticated = true
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Logout ────────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
      })

    // ── Fetch Profile ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user = payload.user
      })
      .addCase(fetchProfile.rejected, (state, { payload }) => {
        state.loading = false
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
        state.user = payload.user
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
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
