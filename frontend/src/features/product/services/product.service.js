import api from '../../../lib/api'

// ─── Products ─────────────────────────────────────────────────────────────────
const getProducts = (params = {}) => api.get('/products', { params })

const getProductById = (id) => api.get(`/products/${id}`)

const createProduct = (productData) => api.post('/products', productData)

const updateProduct = (id, productData) => api.patch(`/products/${id}`, productData)

const deleteProduct = (id) => api.delete(`/products/${id}`)

// ─── Product Variants ─────────────────────────────────────────────────────────
const getVariants = (productId) => api.get(`/products/${productId}/variants`)

const createVariant = (productId, variantData) =>
  api.post(`/products/${productId}/variants`, variantData)

const updateVariant = (productId, variantId, variantData) =>
  api.patch(`/products/${productId}/variants/${variantId}`, variantData)

const deleteVariant = (productId, variantId) =>
  api.delete(`/products/${productId}/variants/${variantId}`)

// ─── Product Stock ────────────────────────────────────────────────────────────
const getProductStock = (productId) => api.get(`/products/${productId}/stock`)

const updateProductStock = (productId, stockData) =>
  api.patch(`/products/${productId}/stock`, stockData)

const getVariantStock = (productId, variantId) =>
  api.get(`/products/${productId}/variants/${variantId}/stock`)

const updateVariantStock = (productId, variantId, stockData) =>
  api.patch(`/products/${productId}/variants/${variantId}/stock`, stockData)

const productService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  getProductStock,
  updateProductStock,
  getVariantStock,
  updateVariantStock,
}

export default productService
