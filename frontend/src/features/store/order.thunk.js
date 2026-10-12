import { createAsyncThunk } from '@reduxjs/toolkit'
import orderService from './services/order.service'

export const createCheckout = createAsyncThunk(
  'order/createCheckout',
  async ({ shippingAddress, idempotencyKey }, { rejectWithValue }) => {
    try {
      const { data } = await orderService.createCheckout({ shippingAddress, idempotencyKey })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create checkout')
    }
  }
)

export const verifyPayment = createAsyncThunk(
  'order/verifyPayment',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await orderService.verifyPayment(body)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment verification failed')
    }
  }
)

export const fetchOrderHistory = createAsyncThunk(
  'order/history',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await orderService.getOrderHistory(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (paymentId, { rejectWithValue }) => {
    try {
      const { data } = await orderService.getOrderById(paymentId)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch order')
    }
  }
)
