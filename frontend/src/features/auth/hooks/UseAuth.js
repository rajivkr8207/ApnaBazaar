import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import {
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../auth.slice'
import { loginUser, fetchProfile, logoutUser, registerUser, updateProfile, verifyOtp } from '../auth.thunk'

const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Selectors
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)

  // ── Register ────────────────────────────────────────────────────────────────
  const handleRegister = async (formData) => {
    const result = await dispatch(registerUser(formData))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please verify your OTP.')
      navigate(`/verify-otp?email=${formData.email}`)
    } else {
      toast.error(result.payload || 'Registration failed')
    }
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async (credentials) => {
    const result = await dispatch(loginUser(credentials))
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user?.name}!`)
      navigate('/dashboard')
    } else {
      toast.error(result.payload || 'Login failed')
    }
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (payload) => {
    console.log(payload)
    const result = await dispatch(verifyOtp(payload))
    if (verifyOtp.fulfilled.match(result)) {
      toast.success('Email verified! Welcome.')
      navigate('/dashboard')
    } else {
      toast.error(result.payload || 'Invalid OTP')
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.info('You have been logged out.')
    navigate('/login')
  }

  // ── Profile ─────────────────────────────────────────────────────────────────
  const loadProfile = () => dispatch(fetchProfile())

  const handleUpdateProfile = async (formData) => {
    const result = await dispatch(updateProfile(formData))
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!')
    } else {
      toast.error(result.payload || 'Update failed')
    }
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  const dismissError = () => dispatch(clearError())

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    handleRegister,
    handleLogin,
    handleVerifyOtp,
    handleLogout,
    loadProfile,
    handleUpdateProfile,
    dismissError,
  }
}

export default useAuth
