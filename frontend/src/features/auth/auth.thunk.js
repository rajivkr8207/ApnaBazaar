import { createAsyncThunk } from "@reduxjs/toolkit"
import authService from "./services/auth.service"



export const registerUser = createAsyncThunk(
    'auth/register',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await authService.register(formData)
            return data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Registration failed')
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await authService.login(credentials)
            return data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Login failed')
        }
    }
)

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await authService.verifyOtp(payload)
            return data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'OTP verification failed')
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout()
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Logout failed')
        }
    }
)

export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await authService.getProfile()
            return data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile')
        }
    }
)

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await authService.updateProfile(formData)
            return data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update profile')
        }
    }
)