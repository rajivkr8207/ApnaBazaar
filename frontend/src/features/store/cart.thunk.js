import { createAsyncThunk } from '@reduxjs/toolkit'
import cartService from './services/cart.service'

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await cartService.getCart()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, variantId = null, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await cartService.addItem(productId, variantId, quantity)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart')
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await cartService.updateItem(itemId, quantity)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update cart')
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await cartService.removeItem(itemId)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart')
    }
  }
)

export const clearCartItems = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await cartService.clearCart()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear cart')
    }
  }
)
