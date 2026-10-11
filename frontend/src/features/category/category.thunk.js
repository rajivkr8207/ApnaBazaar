import { createAsyncThunk } from '@reduxjs/toolkit'
import categoryService from './services/category.service'

export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await categoryService.getCategories()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

export const createCategory = createAsyncThunk(
  'category/create',
  async (categoryData, { rejectWithValue }) => {
    try {
      const { data } = await categoryService.createCategory(categoryData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create category')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const { data } = await categoryService.updateCategory(id, categoryData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update category')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await categoryService.deleteCategory(id)
      return { id, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete category')
    }
  }
)
