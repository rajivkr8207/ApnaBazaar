import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { selectUser } from '../../auth/auth.slice'
import useAuth from '../../auth/hooks/UseAuth'

const Dashboard = () => {
  const user = useSelector(selectUser)
  const { handleLogout } = useAuth()

  const displayName = user?.fullName || user?.name || user?.username || 'User'
  const roleName = user?.role ? user.role.toUpperCase() : 'USER'

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {roleName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-3 tracking-tight">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              You are securely logged into ApnaBazaar ({user?.email || 'authenticated'}).
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <span>👤</span> View Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-800 hover:bg-red-500/15 hover:text-red-400 text-slate-300 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>

        {/* ── User Overview Badges ───────────────────────────────────── */}
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
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Role Access</p>
            <p className="text-sm text-violet-300 font-semibold mt-1">{roleName}</p>
          </div>
        </div>
      </div>

      {/* ── Quick Navigation & Actions ─────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/products"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800/50 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🛍️
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100 group-hover:text-violet-300 transition-colors">
                  Products Catalog
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  View and manage live store products, stock, and pricing
                </p>
              </div>
            </div>
            <span className="text-violet-400 text-lg group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>

          <Link
            to="/categories"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                🏷️
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  Categories
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organize store inventory by categories and departments
                </p>
              </div>
            </div>
            <span className="text-cyan-400 text-lg group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
