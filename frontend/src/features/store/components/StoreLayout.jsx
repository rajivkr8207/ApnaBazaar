import { Outlet, Link, useLocation } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItemCount } from '../cart.slice'
import { selectIsAuthenticated, selectUser } from '../../auth/auth.slice'
import useAuth from '../../auth/hooks/UseAuth'

const StoreNavbar = () => {
  const dispatch = useDispatch()
  const cartCount = useSelector(selectCartItemCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const { handleLogout } = useAuth()
  const { pathname } = useLocation()

  const navLinks = [
    { to: '/store', label: 'Home' },
    { to: '/store/catalog', label: 'Shop' },
    { to: '/store/orders', label: 'My Orders' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/store" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
              🛍️
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent tracking-tight">
              ApnaBazaar
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.to || pathname.startsWith(link.to + '/')
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/store/cart"
              id="store-cart-btn"
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700"
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center bg-violet-500 text-white text-[10px] font-bold rounded-full px-1 shadow-md animate-bounce-once">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                    {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    {user?.fullName || user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  id="store-logout-btn"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-slate-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-md shadow-violet-500/25"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

const StoreLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <StoreNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 ApnaBazaar • Made with ❤️ in India</p>
      </footer>
    </div>
  )
}

export default StoreLayout
