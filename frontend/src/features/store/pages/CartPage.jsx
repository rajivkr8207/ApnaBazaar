import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCartItems,
  selectCartLoading,
  selectCartActionLoading,
  selectCartTotal,
} from '../cart.slice'
import { fetchCart, updateCartItem, removeFromCart, clearCartItems } from '../cart.thunk'
import { selectIsAuthenticated } from '../../auth/auth.slice'
import { toast } from 'react-toastify'

// ── Cart Item Row ─────────────────────────────────────────────────────────────
const CartItem = ({ item, onUpdate, onRemove }) => {
  const price = item?.variantPrice > 0 ? item?.variantPrice : item?.price || 0
  const image = item?.image || item?.images?.[0]
  return (
    <div className="flex gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">📦</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 line-clamp-2">{item?.product?.name}</h4>
        {item?.variantName && (
          <span className="text-xs text-violet-400 mt-0.5 block">{item?.variantName}</span>
        )}
        <p className="text-base font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mt-1">
          ₹{(item?.price?.amount * item?.quantity).toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-slate-500">₹{Number(item?.price?.amount).toLocaleString('en-IN')} each</p>
      </div>

      {/* Quantity & Remove */}
      <div className="flex flex-col items-end gap-2">
        {/* Qty control */}
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-xl border border-slate-700 p-1">
          <button
            onClick={() => {
              if (item?.quantity <= 1) onRemove(item?._id)
              else onUpdate(item?._id, item?.quantity - 1)
            }}
            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            −
          </button>
          <span className="w-6 text-center text-white text-sm font-semibold">{item?.quantity}</span>
          <button
            onClick={() => onUpdate(item?._id, item?.quantity + 1)}
            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item?._id)}
          id={`remove-cart-${item?._id}`}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ── Empty Cart ────────────────────────────────────────────────────────────────
const EmptyCart = () => (
  <div className="text-center py-24">
    <div className="text-7xl mb-6 animate-bounce">🛒</div>
    <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
    <p className="text-slate-400 mb-8">Add some amazing products to get started!</p>
    <Link
      to="/store/catalog"
      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all duration-300 shadow-xl shadow-violet-500/30"
    >
      Start Shopping →
    </Link>
  </div>
)

// ── Cart Page ─────────────────────────────────────────────────────────────────
const CartPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const loading = useSelector(selectCartLoading)
  const actionLoading = useSelector(selectCartActionLoading)
  const total = useSelector(selectCartTotal)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart())
  }, [dispatch, isAuthenticated])

  const handleUpdate = async (itemId, quantity) => {
    const res = await dispatch(updateCartItem({ itemId, quantity }))
    if (res.meta.requestStatus === 'rejected') {
      toast.error(res.payload || 'Could not update cart')
    }
  }

  const handleRemove = async (itemId) => {
    const res = await dispatch(removeFromCart(itemId))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.info('Item removed')
    }
  }

  const handleClear = async () => {
    if (!window.confirm('Clear all items from cart?')) return
    dispatch(clearCartItems())
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to checkout')
      navigate('/login')
      return
    }
    navigate('/store/checkout')
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-24 animate-fade-up">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-3">Sign in to view your cart</h2>
        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 transition-all">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Shopping <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Cart</span>
        </h1>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            disabled={actionLoading}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery</span>
                  <span className="text-green-400">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <span className="font-bold text-white">Total</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                id="checkout-btn"
                onClick={handleCheckout}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              >
                Proceed to Checkout →
              </button>

              <Link
                to="/store/catalog"
                className="block text-center text-sm text-slate-400 hover:text-slate-200 transition-colors mt-2"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
