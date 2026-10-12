import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectIsInitialized,
  selectUser,
} from '../features/auth/auth.slice'
import LoadingScreen from '../components/common/LoadingScreen'

const ProtectedRoute = ({ allowedRoles = [], redirectTo = '/login' }) => {
  const isInitialized = useSelector(selectIsInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  // Wait for initial session verification on page refresh
  if (!isInitialized) {
    return <LoadingScreen message="Checking authorization..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

// ─── GuestRoute ───────────────────────────────────────────────────────────────
/**
 * Wraps public-only routes (login, register, verify-otp).
 * Redirects authenticated users away from auth pages to dashboard.
 */
export const GuestRoute = ({ redirectTo = '/dashboard' }) => {
  const isInitialized = useSelector(selectIsInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Wait for initial session verification on page refresh
  if (!isInitialized) {
    return <LoadingScreen message="Verifying session..." />
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default ProtectedRoute

