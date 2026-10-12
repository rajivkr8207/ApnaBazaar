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

// ── Seller / Admin Feature Pages ─────────────────────────────────────────────
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import VerifyOtp from '../features/auth/pages/VerifyOtp'
import Profile from '../features/auth/pages/Profile'
import Dashboard from '../features/dashboard/pages/Dashboard'
import ProductsPage from '../features/product/pages/ProductsPage'
import ProductDetailPage from '../features/product/pages/ProductDetailPage'
import CategoryList from '../features/category/pages/CategoryList'

// ── Customer Store Pages ─────────────────────────────────────────────────────
import StoreLayout from '../features/store/components/StoreLayout'
import StoreFrontPage from '../features/store/pages/StoreFrontPage'
import CatalogPage from '../features/store/pages/CatalogPage'
import StoreProductDetailPage from '../features/store/pages/ProductDetailPage'
import CartPage from '../features/store/pages/CartPage'
import CheckoutPage from '../features/store/pages/CheckoutPage'
import OrdersPage from '../features/store/pages/OrdersPage'

// ── Root Index Redirect Helper ───────────────────────────────────────────────
const RootRedirect = () => {
  const isInitialized = useSelector(selectIsInitialized)

  if (!isInitialized) {
    return <LoadingScreen message="Checking session..." />
  }

  // Always send to the customer storefront by default
  return <Navigate to="/store" replace />
}

// ── App Router ───────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Default redirect ──────────────────────────────────────────────── */}
        <Route index element={<RootRedirect />} />

        {/* ── Guest-only routes (redirect if already logged in) ─────────────── */}
        <Route element={<GuestRoute redirectTo="/store" />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>

        {/* ── Customer Store (public browsable, auth for cart/checkout/orders) ── */}
        <Route path="/store" element={<StoreLayout />}>
          <Route index element={<StoreFrontPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="product/:id" element={<StoreProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        {/* ── Seller / Admin Dashboard (protected) ──────────────────────────── */}
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