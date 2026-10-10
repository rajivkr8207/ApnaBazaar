import { Navigate, Outlet } from 'react-router'
import { useSelector }       from 'react-redux'
import {
  selectIsAuthenticated,
  selectUser,
} from '../features/auth/auth.slice'

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
/**
 * Wraps routes that require authentication (and optionally a specific role).
 *
 * Usage in routes:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */
const ProtectedRoute = ({ allowedRoles = [], redirectTo = '/login' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user            = useSelector(selectUser)

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
 * Redirects authenticated users away from auth pages.
 */
export const GuestRoute = ({ redirectTo = '/dashboard' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
