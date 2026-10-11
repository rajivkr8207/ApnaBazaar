import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router'
import { useSelector } from 'react-redux'
import ProtectedRoute, { GuestRoute } from './Protected.jsx'
import { ROLES } from '../constants/roles'
import { selectIsAuthenticated, selectIsInitialized, selectUser } from '../features/auth/auth.slice'
import useAuth from '../features/auth/hooks/UseAuth'
import LoadingScreen from '../components/common/LoadingScreen'

// ── Pages ─────────────────────────────────────────────────────────────────────
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import VerifyOtp from '../features/auth/pages/VerifyOtp'
import Profile from '../features/auth/pages/Profile'

// ── Dashboard Component ───────────────────────────────────────────────────────
const Dashboard = () => {
  const user = useSelector(selectUser)
  const { handleLogout } = useAuth()

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        background:
          'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), #0f172a',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {user?.role ? user.role.toUpperCase() : 'USER'}
              </span>
              <h1 className="text-3xl font-bold text-slate-100 mt-2">
                Welcome back, {user?.fullName || user?.name || user?.username || 'User'}! 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                You are securely logged into ApnaBazaar ({user?.email || 'authenticated'}).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="px-4 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center gap-1.5"
              >
                <span>👤</span> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 hover:bg-red-500/15 hover:text-red-400 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">User ID</p>
              <p className="text-xs text-slate-300 font-mono mt-1 truncate">{user?._id || '—'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Username</p>
              <p className="text-sm text-slate-300 font-medium mt-1">@{user?.username || '—'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Session Status</p>
              <span className="inline-flex items-center gap-2 text-xs text-emerald-400 font-medium mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Persisted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

// ── Root Index Redirect ───────────────────────────────────────────────────────
const RootRedirect = () => {
  const isInitialized = useSelector(selectIsInitialized)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isInitialized) {
    return <LoadingScreen message="Checking session..." />
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

// ─── App Router ───────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Default redirect based on auth status ─────────────────────────── */}
        <Route index element={<RootRedirect />} />

        {/* ── Guest-only routes (redirect if already logged in) ──────────── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>

        {/* ── Protected routes (must be logged in) ──────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* ── Admin-only routes ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          {/* <Route path="/admin" element={<AdminPanel />} /> */}
        </Route>

        {/* ── Misc ───────────────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter