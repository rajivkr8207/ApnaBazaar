import { createSlice } from '@reduxjs/toolkit'
import { createCheckout, verifyPayment, fetchOrderHistory, fetchOrderById } from './order.thunk'

const initialState = {
  checkoutData: null,      // razorpay order details
  currentOrder: null,      // latest verified order
  orders: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 1 },
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => { state.error = null },
    clearCheckout: (state) => { state.checkoutData = null },
  },
  extraReducers: (builder) => {
    // ── Create Checkout ───────────────────────────────────────────────────────
    builder
      .addCase(createCheckout.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createCheckout.fulfilled, (state, { payload }) => {
        state.loading = false
        state.checkoutData = payload?.data || payload
      })
      .addCase(createCheckout.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Verify Payment ────────────────────────────────────────────────────────
    builder
      .addCase(verifyPayment.pending, (state) => { state.loading = true; state.error = null })
      .addCase(verifyPayment.fulfilled, (state, { payload }) => {
        state.loading = false
        state.currentOrder = payload?.data || payload
        state.checkoutData = null
      })
      .addCase(verifyPayment.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Order History ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchOrderHistory.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchOrderHistory.fulfilled, (state, { payload }) => {
        state.loading = false
        const d = payload?.data || payload
        state.orders = d?.orders || []
        state.pagination = d?.pagination || state.pagination
      })
      .addCase(fetchOrderHistory.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Order By ID ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchOrderById.pending, (state) => { state.loading = true })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => {
        state.loading = false
        state.currentOrder = payload?.data || payload
      })
      .addCase(fetchOrderById.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  },
})

export const { clearOrderError, clearCheckout } = orderSlice.actions

export const selectCheckoutData = (state) => state.order.checkoutData
export const selectCurrentOrder = (state) => state.order.currentOrder
export const selectOrders = (state) => state.order.orders
export const selectOrderPagination = (state) => state.order.pagination
export const selectOrderLoading = (state) => state.order.loading
export const selectOrderError = (state) => state.order.error

export default orderSlice.reducer
