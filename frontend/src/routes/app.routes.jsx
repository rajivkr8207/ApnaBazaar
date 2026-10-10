import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ProtectedRoute, { GuestRoute } from './Protected.jsx'
import { ROLES } from '../constants/roles'

// ── Pages ─────────────────────────────────────────────────────────────────────
import Login      from '../features/auth/pages/Login'
import Register   from '../features/auth/pages/Register'
import VerifyOtp  from '../features/auth/pages/VerifyOtp'
import Profile    from '../features/auth/pages/Profile'

// ── Placeholder Dashboard (replace with real pages later)
const Dashboard = () => (
  <div style={{ color: '#f8fafc', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
    <h1>Dashboard</h1>
    <p>You are logged in.</p>
  </div>
)

const Unauthorized = () => (
  <div style={{ color: '#f8fafc', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
    <h1>403 – Unauthorized</h1>
    <p>You do not have permission to access this page.</p>
  </div>
)

const NotFound = () => (
  <div style={{ color: '#f8fafc', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
    <h1>404 – Page Not Found</h1>
  </div>
)

// ─── App Router ───────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Default redirect ──────────────────────────────────────────────── */}
        <Route index element={<Navigate to="/login" replace />} />

        {/* ── Guest-only routes (redirect if already logged in) ──────────── */}
        <Route element={<GuestRoute />}>
          <Route path="/login"      element={<Login />}     />
          <Route path="/register"   element={<Register />}  />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>

        {/* ── Protected routes (must be logged in) ──────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<Profile />}   />
        </Route>

        {/* ── Admin-only routes ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
        </Route>

        {/* ── Misc ───────────────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*"             element={<NotFound />}     />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter