import { createSlice } from '@reduxjs/toolkit'
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchVariants,
  createVariant,
  deleteVariant,
  fetchProductStock,
  upsertStock,
} from './product.thunk'

const initialState = {
  products: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  currentProduct: null,
  variantsByProductId: {}, // { [productId]: [variant1, variant2] }
  stockByItemKey: {}, // { [`${productId}_${variantId || 'base'}`]: stockObj }
  loading: false,
  variantLoading: false,
  stockLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Products ────────────────────────────────────────────────────────
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false
        const data = payload.data || payload
        state.products = data.products || (Array.isArray(data) ? data : [])
        state.pagination = data.pagination || state.pagination
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Fetch Product By ID ───────────────────────────────────────────────────
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, { payload }) => {
        state.loading = false
        state.currentProduct = payload.data || payload
      })
      .addCase(fetchProductById.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Create Product ────────────────────────────────────────────────────────
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.loading = false
        const newProduct = payload.data || payload
        if (newProduct) {
          state.products.unshift(newProduct)
          state.currentProduct = newProduct
        }
      })
      .addCase(createProduct.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Update Product ────────────────────────────────────────────────────────
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.loading = false
        const updated = payload.data || payload
        if (updated?._id) {
          const idx = state.products.findIndex((p) => p._id === updated._id)
          if (idx !== -1) state.products[idx] = updated
          if (state.currentProduct?._id === updated._id) state.currentProduct = updated
        }
      })
      .addCase(updateProduct.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Delete Product ────────────────────────────────────────────────────────
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.loading = false
        state.products = state.products.filter((p) => p._id !== payload.id)
        if (state.currentProduct?._id === payload.id) state.currentProduct = null
      })
      .addCase(deleteProduct.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Variants ──────────────────────────────────────────────────────────────
    builder
      .addCase(fetchVariants.pending, (state) => {
        state.variantLoading = true
      })
      .addCase(fetchVariants.fulfilled, (state, { payload }) => {
        state.variantLoading = false
        state.variantsByProductId[payload.productId] = payload.variants || []
      })
      .addCase(fetchVariants.rejected, (state) => {
        state.variantLoading = false
      })

      .addCase(createVariant.pending, (state) => {
        state.variantLoading = true
      })
      .addCase(createVariant.fulfilled, (state, { payload }) => {
        state.variantLoading = false
        const currentList = state.variantsByProductId[payload.productId] || []
        state.variantsByProductId[payload.productId] = [payload.variant, ...currentList]
      })
      .addCase(createVariant.rejected, (state, { payload }) => {
        state.variantLoading = false
        state.error = payload
      })

      .addCase(deleteVariant.fulfilled, (state, { payload }) => {
        const currentList = state.variantsByProductId[payload.productId] || []
        state.variantsByProductId[payload.productId] = currentList.filter(
          (v) => v._id !== payload.variantId
        )
      })

    // ── Stock ─────────────────────────────────────────────────────────────────
    builder
      .addCase(fetchProductStock.pending, (state) => {
        state.stockLoading = true
      })
      .addCase(fetchProductStock.fulfilled, (state, { payload }) => {
        state.stockLoading = false
        const key = `${payload.productId}_${payload.variantId || 'base'}`
        state.stockByItemKey[key] = payload.stock
      })
      .addCase(fetchProductStock.rejected, (state) => {
        state.stockLoading = false
      })

      .addCase(upsertStock.pending, (state) => {
        state.stockLoading = true
      })
      .addCase(upsertStock.fulfilled, (state, { payload }) => {
        state.stockLoading = false
        const key = `${payload.productId}_${payload.variantId || 'base'}`
        state.stockByItemKey[key] = payload.stock
      })
      .addCase(upsertStock.rejected, (state, { payload }) => {
        state.stockLoading = false
        state.error = payload
      })
  },
})

export const { clearProductError, setCurrentProduct } = productSlice.actions

export const selectProducts = (state) => state.product.products
export const selectPagination = (state) => state.product.pagination
export const selectCurrentProduct = (state) => state.product.currentProduct
export const selectVariantsByProductId = (productId) => (state) =>
  state.product.variantsByProductId[productId] || []
export const selectStockByItemKey = (productId, variantId) => (state) =>
  state.product.stockByItemKey[`${productId}_${variantId || 'base'}`]
export const selectProductLoading = (state) => state.product.loading
export const selectVariantLoading = (state) => state.product.variantLoading
export const selectStockLoading = (state) => state.product.stockLoading
export const selectProductError = (state) => state.product.error

export default productSlice.reducer
