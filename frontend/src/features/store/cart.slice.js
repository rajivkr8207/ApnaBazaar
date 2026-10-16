import { createSlice } from '@reduxjs/toolkit'
import { fetchCart, addToCart, updateCartItem, removeFromCart, clearCartItems } from './cart.thunk'

const normalizeCart = (payload) => {
  const data = payload?.data || payload || {}
  return {
    items: data.items || [],
    itemCount: data.itemCount ?? data.items?.length ?? 0,
  }
}

const initialState = {
  items: [],
  itemCount: 0,
  loading: false,
  actionLoading: false, // for add/update/remove ops
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => { state.error = null },
    resetCart: (state) => {
      state.items = []
      state.itemCount = 0
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Cart ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false
        const { items, itemCount } = normalizeCart(payload)
        state.items = items
        state.itemCount = itemCount
      })
      .addCase(fetchCart.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Add Item ──────────────────────────────────────────────────────────────
    builder
      .addCase(addToCart.pending, (state) => { state.actionLoading = true; state.error = null })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        const { items, itemCount } = normalizeCart(payload)
        state.items = items
        state.itemCount = itemCount
      })
      .addCase(addToCart.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.error = payload
      })

    // ── Update Item ───────────────────────────────────────────────────────────
    builder
      .addCase(updateCartItem.pending, (state) => { state.actionLoading = true })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        const { items, itemCount } = normalizeCart(payload)
        state.items = items
        state.itemCount = itemCount
      })
      .addCase(updateCartItem.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.error = payload
      })

    // ── Remove Item ───────────────────────────────────────────────────────────
    builder
      .addCase(removeFromCart.pending, (state) => { state.actionLoading = true })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        state.actionLoading = false
        const { items, itemCount } = normalizeCart(payload)
        state.items = items
        state.itemCount = itemCount
      })
      .addCase(removeFromCart.rejected, (state, { payload }) => {
        state.actionLoading = false
        state.error = payload
      })

    // ── Clear Cart ────────────────────────────────────────────────────────────
    builder
      .addCase(clearCartItems.fulfilled, (state) => {
        state.items = []
        state.itemCount = 0
      })
  },
})

export const { clearCartError, resetCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartItemCount = (state) => state.cart.itemCount
export const selectCartLoading = (state) => state.cart.loading
export const selectCartActionLoading = (state) => state.cart.actionLoading
export const selectCartError = (state) => state.cart.error
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price = item?.price?.amount || 0
    return sum + price * (item?.quantity || 1)
  }, 0)

export default cartSlice.reducer
