import { createAsyncThunk } from '@reduxjs/toolkit'
import productService from './services/product.service'

// ─── Products ─────────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await productService.getProducts(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await productService.getProductById(id)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product')
    }
  }
)

export const createProduct = createAsyncThunk(
  'product/create',
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await productService.createProduct(productData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product')
    }
  }
)

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await productService.updateProduct(id, productData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await productService.deleteProduct(id)
      return { id, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product')
    }
  }
)

// ─── Variants ─────────────────────────────────────────────────────────────────
export const fetchVariants = createAsyncThunk(
  'product/fetchVariants',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await productService.getVariants(productId)
      return { productId, variants: data.data || data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch variants')
    }
  }
)

export const createVariant = createAsyncThunk(
  'product/createVariant',
  async ({ productId, variantData }, { rejectWithValue }) => {
    try {
      const { data } = await productService.createVariant(productId, variantData)
      return { productId, variant: data.data || data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create variant')
    }
  }
)

export const deleteVariant = createAsyncThunk(
  'product/deleteVariant',
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      await productService.deleteVariant(productId, variantId)
      return { productId, variantId }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete variant')
    }
  }
)

// ─── Stock ────────────────────────────────────────────────────────────────────
export const fetchProductStock = createAsyncThunk(
  'product/fetchStock',
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      const { data } = variantId
        ? await productService.getVariantStock(productId, variantId)
        : await productService.getProductStock(productId)
      return { productId, variantId, stock: data.data || data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock')
    }
  }
)

export const upsertStock = createAsyncThunk(
  'product/upsertStock',
  async ({ productId, variantId, stockData }, { rejectWithValue }) => {
    try {
      const { data } = variantId
        ? await productService.updateVariantStock(productId, variantId, stockData)
        : await productService.updateProductStock(productId, stockData)
      return { productId, variantId, stock: data.data || data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update stock')
    }
  }
)
