import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import useAuth from '../../features/auth/hooks/UseAuth'
import { selectUser } from '../../features/auth/auth.slice'
import { ROLE_LABELS } from '../../constants/roles'

// ─── Nav Item ─────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon, label, collapsed }) => {
  const { pathname } = useLocation()
  const active = pathname === to || pathname.startsWith(to + '/')

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm',
        'transition-all duration-200 group relative',
        active
          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-sm shadow-violet-500/10'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
      ].join(' ')}
    >
      <span className="text-lg flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
      {active && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
      )}
    </Link>
  )
}

// ─── SideNavbar ───────────────────────────────────────────────────────────────
const SideNavbar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const user = useSelector(selectUser)
  const { handleLogout } = useAuth()

  const navLinks = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/products', icon: '🛍️', label: 'Products' },
    { to: '/categories', icon: '🏷️', label: 'Categories' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ]

  const displayName = user?.fullName || user?.name || user?.username || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <aside
      className={[
        'flex flex-col h-screen bg-slate-900 border-r border-slate-800',
        'transition-all duration-300 ease-in-out select-none flex-shrink-0 z-30',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-3 px-3.5 py-4 border-b border-slate-800 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-gradient-to-br from-violet-500 to-cyan-400 shadow-md shadow-violet-500/30">
          🛍️
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-base font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent tracking-tight whitespace-nowrap block">
              ApnaBazaar
            </span>
          </div>
        )}
      </div>

      {/* ── Nav Links ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => (
          <NavItem key={link.to} {...link} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── User & Controls Footer ────────────────────────────────────────── */}
      <div className="px-2.5 py-3 border-t border-slate-800 space-y-1.5">
        {/* User Card */}
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/50 mb-1 border border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {ROLE_LABELS[user.role] || user.role || 'Member'}
              </p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 text-xs font-medium ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="text-base flex-shrink-0">{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        {/* Logout */}
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-xs font-medium ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <span className="text-base flex-shrink-0">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default SideNavbar
