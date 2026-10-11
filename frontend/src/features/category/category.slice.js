import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './category.thunk'

const initialState = {
  categories: [],
  loading: false,
  error: null,
}

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Categories ──────────────────────────────────────────────────────
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false
        state.categories = payload.data || payload || []
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Create Category ───────────────────────────────────────────────────────
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, { payload }) => {
        state.loading = false
        const newCategory = payload.data || payload
        if (newCategory) {
          state.categories.unshift(newCategory)
        }
      })
      .addCase(createCategory.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Update Category ───────────────────────────────────────────────────────
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.loading = false
        const updated = payload.data || payload
        if (updated?._id) {
          const index = state.categories.findIndex((c) => c._id === updated._id)
          if (index !== -1) {
            state.categories[index] = updated
          }
        }
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })

    // ── Delete Category ───────────────────────────────────────────────────────
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.loading = false
        state.categories = state.categories.filter((c) => c._id !== payload.id)
      })
      .addCase(deleteCategory.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  },
})

export const { clearCategoryError } = categorySlice.actions

export const selectCategories = (state) => state.category.categories
export const selectCategoryLoading = (state) => state.category.loading
export const selectCategoryError = (state) => state.category.error

export default categorySlice.reducer
