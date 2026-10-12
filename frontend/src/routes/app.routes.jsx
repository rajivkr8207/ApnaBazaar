import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import ProtectedRoute, { GuestRoute } from './Protected.jsx'
import { ROLES } from '../constants/roles'
import { selectIsAuthenticated, selectIsInitialized } from '../features/auth/auth.slice'
import LoadingScreen from '../components/common/LoadingScreen'

// ── Layout & Common Components ───────────────────────────────────────────────
import AppLayout from '../components/layout/AppLayout'
import Unauthorized from '../components/common/Unauthorized'
import NotFound from '../components/common/NotFound'

// ── Feature Pages ────────────────────────────────────────────────────────────
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import VerifyOtp from '../features/auth/pages/VerifyOtp'
import Profile from '../features/auth/pages/Profile'
import Dashboard from '../features/dashboard/pages/Dashboard'
import ProductsPage from '../features/product/pages/ProductsPage'
import ProductDetailPage from '../features/product/pages/ProductDetailPage'
import CategoryList from '../features/category/pages/CategoryList'

// ── Root Index Redirect Helper ───────────────────────────────────────────────
const RootRedirect = () => {
  const isInitialized = useSelector(selectIsInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isInitialized) {
    return <LoadingScreen message="Checking session..." />
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

// ── App Router ───────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Default redirect based on auth status ─────────────────────────── */}
        <Route index element={<RootRedirect />} />

        {/* ── Guest-only routes (redirect if already logged in) ─────────────── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>

        {/* ── Protected routes (must be logged in) ──────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ── Admin-only routes ──────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
        </Route>

        {/* ── Misc error & fallback routes ──────────────────────────────────── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter