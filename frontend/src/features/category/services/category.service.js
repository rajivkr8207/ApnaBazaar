import api from '../../../lib/api'

// ─── Category Service ──────────────────────────────────────────────────────────
const getCategories = () => api.get('/categories')

const createCategory = (categoryData) => api.post('/categories', categoryData)

const updateCategory = (id, categoryData) => api.patch(`/categories/${id}`, categoryData)

const deleteCategory = (id) => api.delete(`/categories/${id}`)

const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}

export default categoryService
