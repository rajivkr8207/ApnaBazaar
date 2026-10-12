import api from '../../../lib/api'

// ─── Payment / Order Service ──────────────────────────────────────────────────

/**
 * POST /payment/checkout
 * Body: { shippingAddress, idempotencyKey }
 */
const createCheckout = (body) => api.post('/payment/checkout', body)

/**
 * POST /payment/verify
 * Body: { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPayment = (body) => api.post('/payment/verify', body)

/**
 * GET /payment
 * Query: { page, limit }
 */
const getOrderHistory = (params) => api.get('/payment', { params })

/**
 * GET /payment/:paymentId
 */
const getOrderById = (paymentId) => api.get(`/payment/${paymentId}`)

const orderService = { createCheckout, verifyPayment, getOrderHistory, getOrderById }
export default orderService
