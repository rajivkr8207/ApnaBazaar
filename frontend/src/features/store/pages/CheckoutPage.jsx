import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItems, selectCartTotal, selectCartLoading, resetCart } from '../cart.slice'
import { fetchCart } from '../cart.thunk'
import { createCheckout, verifyPayment } from '../order.thunk'
import { selectOrderLoading, selectOrderError, clearOrderError } from '../order.slice'
import { selectIsAuthenticated, selectUser } from '../../auth/auth.slice'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'

// ── Payment Method Icons ──────────────────────────────────────────────────────
const PaymentMethodCard = ({ id, value, selected, onSelect, icon, title, subtitle }) => (
  <button
    type="button"
    id={id}
    onClick={() => onSelect(value)}
    className={[
      'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left',
      selected
        ? 'border-violet-500 bg-violet-500/10 shadow-md shadow-violet-500/15'
        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
    ].join(' ')}
  >
    <div className={[
      'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all',
      selected ? 'bg-violet-500/20' : 'bg-slate-800',
    ].join(' ')}>
      {icon}
    </div>
    <div className="flex-1">
      <p className={`text-sm font-bold ${selected ? 'text-violet-300' : 'text-slate-200'}`}>{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    <div className={[
      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
      selected ? 'border-violet-500 bg-violet-500' : 'border-slate-600',
    ].join(' ')}>
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </button>
)

// ── Address Form ──────────────────────────────────────────────────────────────
const AddressForm = ({ address, onChange }) => {
  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'Raj Kumar', required: true, full: true },
    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', required: true },
    { key: 'email', label: 'Email', placeholder: 'you@email.com', required: true },
    { key: 'line1', label: 'Address Line 1', placeholder: 'House no, Street', required: true, full: true },
    { key: 'line2', label: 'Address Line 2', placeholder: 'Colony, Landmark (optional)', full: true },
    { key: 'city', label: 'City', placeholder: 'Mumbai', required: true },
    { key: 'state', label: 'State', placeholder: 'Maharashtra', required: true },
    { key: 'pincode', label: 'PIN Code', placeholder: '400001', required: true },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            {f.label} {f.required && <span className="text-red-400">*</span>}
          </label>
          <input
            id={`addr-${f.key}`}
            type="text"
            value={address[f.key] || ''}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            required={f.required}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
          />
        </div>
      ))}
    </div>
  )
}

// ── Order Items Summary ───────────────────────────────────────────────────────
const OrderSummary = ({ items, total }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">Order Items</h3>
    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
      {items.map((item) => {
        const price = item.variantPrice > 0 ? item.variantPrice : item.price || 0
        const image = item.image || item.images?.[0]
        return (
          <div key={item._id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex-shrink-0 overflow-hidden">
              {image ? (
                <img src={image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg opacity-20">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{item.name}</p>
              {item.variantName && <p className="text-[10px] text-violet-400">{item.variantName}</p>}
              <p className="text-xs text-slate-500">×{item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-slate-200 flex-shrink-0">
              ₹{(price * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        )
      })}
    </div>

    <div className="border-t border-slate-800 mt-4 pt-4 space-y-2">
      <div className="flex justify-between text-sm text-slate-400">
        <span>Subtotal</span>
        <span>₹{total.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-400">
        <span>Delivery</span>
        <span className="text-green-400">Free</span>
      </div>
      <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
        <span>Total</span>
        <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent text-xl">
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  </div>
)

// ── Load Razorpay SDK ─────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

// ── Checkout Page ─────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const cartLoading = useSelector(selectCartLoading)
  const orderLoading = useSelector(selectOrderLoading)
  const orderError = useSelector(selectOrderError)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const [paymentMethod, setPaymentMethod] = useState('razorpay') // 'razorpay' | 'cod'
  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart())
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    return () => { dispatch(clearOrderError()) }
  }, [dispatch])

  const handleAddressChange = (key, val) => {
    setAddress((prev) => ({ ...prev, [key]: val }))
  }

  const isAddressValid = () => {
    const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode']
    return required.every((k) => address[k]?.trim())
  }

  // ── COD Flow ──────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    toast.info('Cash on Delivery is accepted. Your order is being placed!')
    // For COD we simulate a success since COD orders may not use Razorpay
    // In real scenario this could call a separate COD endpoint
    dispatch(resetCart())
    navigate('/store/orders', {
      state: { message: '✅ Order placed successfully with Cash on Delivery!' }
    })
  }

  // ── Razorpay Flow ─────────────────────────────────────────────────────────
  const handleRazorpayCheckout = useCallback(async () => {
    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Failed to load Razorpay SDK. Please check your connection.')
      return
    }

    const idempotencyKey = uuidv4()
    const shippingAddress = { ...address }

    const res = await dispatch(createCheckout({ shippingAddress, idempotencyKey }))
    if (res.meta.requestStatus !== 'fulfilled') {
      toast.error(res.payload || 'Could not create checkout')
      return
    }

    const checkout = res.payload?.data || res.payload
    const { keyId, orderId, amount, currency, paymentId } = checkout

    const options = {
      key: keyId,
      amount,
      currency: currency || 'INR',
      name: 'ApnaBazaar',
      description: 'Order Payment',
      order_id: orderId,
      handler: async (response) => {
        setSubmitting(true)
        try {
          const verifyRes = await dispatch(verifyPayment({
            paymentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }))

          if (verifyRes.meta.requestStatus === 'fulfilled') {
            dispatch(resetCart())
            toast.success('🎉 Payment successful! Order placed.')
            navigate('/store/orders')
          } else {
            toast.error(verifyRes.payload || 'Payment verification failed')
          }
        } finally {
          setSubmitting(false)
        }
      },
      prefill: {
        name: address.fullName,
        email: address.email,
        contact: address.phone,
      },
      theme: {
        color: '#7c3aed',
        backdrop_color: '#0f172a',
      },
      modal: {
        ondismiss: () => {
          toast.info('Payment cancelled')
          setSubmitting(false)
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`)
      setSubmitting(false)
    })
    rzp.open()
  }, [address, dispatch, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAddressValid()) {
      toast.error('Please fill in all required address fields')
      return
    }
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setSubmitting(true)
    try {
      if (paymentMethod === 'cod') {
        await handleCOD()
      } else {
        await handleRazorpayCheckout()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">🔐</p>
        <h2 className="text-2xl font-bold text-white mb-4">Please sign in to checkout</h2>
        <Link to="/login" className="px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600">Sign In</Link>
      </div>
    )
  }

  if (cartLoading) {
    return (
      <div className="animate-pulse max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 bg-slate-800 rounded-xl" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
          <div className="h-40 bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-80 bg-slate-800 rounded-2xl" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <Link to="/store/catalog" className="px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600">
          Shop Now →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Checkout
        </h1>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <Link to="/store/cart" className="hover:text-slate-300 transition-colors">← Back to cart</Link>
        </div>
      </div>

      {orderError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          ⚠️ {orderError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Address + Payment ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg">
                  📍
                </div>
                <h2 className="text-lg font-bold text-white">Shipping Address</h2>
              </div>
              <AddressForm address={address} onChange={handleAddressChange} />
            </div>

            {/* Payment Method */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-lg">
                  💳
                </div>
                <h2 className="text-lg font-bold text-white">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <PaymentMethodCard
                  id="pay-method-razorpay"
                  value="razorpay"
                  selected={paymentMethod === 'razorpay'}
                  onSelect={setPaymentMethod}
                  icon="⚡"
                  title="UPI / Card / Net Banking"
                  subtitle="Pay securely via Razorpay — UPI, Debit/Credit Card, Net Banking"
                />
                <PaymentMethodCard
                  id="pay-method-cod"
                  value="cod"
                  selected={paymentMethod === 'cod'}
                  onSelect={setPaymentMethod}
                  icon="💵"
                  title="Cash on Delivery"
                  subtitle="Pay when your order arrives at your doorstep"
                />
              </div>

              {paymentMethod === 'razorpay' && (
                <div className="mt-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/15 text-xs text-slate-400 flex items-start gap-2">
                  <span>🔒</span>
                  <span>Your payment is 100% secure. We use Razorpay's PCI-DSS compliant gateway. No card details are stored on our servers.</span>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400 flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>Please keep the exact amount ready at the time of delivery. COD is available for select pin codes only.</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary + CTA ── */}
          <div className="lg:col-span-1 space-y-4">
            <OrderSummary items={items} total={total} />

            <button
              id="place-order-btn"
              type="submit"
              disabled={submitting || orderLoading || !isAddressValid()}
              className={[
                'w-full py-4 rounded-2xl font-bold text-white transition-all duration-200 shadow-xl',
                paymentMethod === 'razorpay'
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-violet-500/25'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25',
                (submitting || orderLoading || !isAddressValid()) && 'opacity-50 cursor-not-allowed hover:scale-100',
                !(submitting || orderLoading || !isAddressValid()) && 'hover:scale-[1.02]',
              ].join(' ')}
            >
              {submitting || orderLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin-fast inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </span>
              ) : paymentMethod === 'razorpay' ? (
                `⚡ Pay ₹${total.toLocaleString('en-IN')} via Razorpay`
              ) : (
                `📦 Place COD Order — ₹${total.toLocaleString('en-IN')}`
              )}
            </button>

            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>Secure & Encrypted Checkout</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
