import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderHistory } from '../order.thunk'
import {
  selectOrders,
  selectOrderLoading,
  selectOrderPagination,
} from '../order.slice'
import { selectIsAuthenticated } from '../../auth/auth.slice'
import { toast } from 'react-toastify'

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    paid: { label: 'Paid', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
    pending: { label: 'Pending', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    failed: { label: 'Failed', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    expired: { label: 'Expired', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
    refunded: { label: 'Refunded', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    refund_pending: { label: 'Refund Pending', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    cod: { label: 'COD', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  }
  const { label, color } = map[status] || { label: status, color: 'bg-slate-500/15 text-slate-400 border-slate-500/30' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  )
}

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const totalItems = order.orderItems?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="text-xs font-mono text-slate-500">#{String(order._id).slice(-8).toUpperCase()}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-slate-400">{date} • {totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            ₹{Number(order.price?.amount || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Order Items Preview */}
      {order.orderItems?.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {order.orderItems.slice(0, 4).map((item, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs opacity-30">📦</div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium truncate max-w-[100px]">{item.title}</p>
                <p className="text-[10px] text-slate-500">×{item.quantity}</p>
              </div>
            </div>
          ))}
          {order.orderItems.length > 4 && (
            <div className="flex-shrink-0 flex items-center justify-center bg-slate-800/40 rounded-lg px-3 py-2 text-xs text-slate-400">
              +{order.orderItems.length - 4} more
            </div>
          )}
        </div>
      )}

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-start gap-2">
          <span className="text-sm">📍</span>
          <p className="text-xs text-slate-500 line-clamp-1">
            {[
              order.shippingAddress.fullName,
              order.shippingAddress.line1,
              order.shippingAddress.city,
              order.shippingAddress.state,
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Orders Page ───────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const orders = useSelector(selectOrders)
  const loading = useSelector(selectOrderLoading)
  const pagination = useSelector(selectOrderPagination)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    dispatch(fetchOrderHistory({ page: 1, limit: 20 }))
  }, [dispatch, isAuthenticated, navigate])

  // Show success message from checkout redirect
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-xl w-48" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            My <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Orders</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total} total order{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/store/catalog"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
        >
          Shop More →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-7xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-white mb-3">No orders yet</h2>
          <p className="text-slate-400 mb-8">Start shopping to see your orders here</p>
          <Link
            to="/store/catalog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all"
          >
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
