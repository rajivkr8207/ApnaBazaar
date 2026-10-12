import api from '../../../lib/api'

// ─── Catalog / Public Product Service ────────────────────────────────────────

/**
 * GET /products/catalog
 * Query: { category, search, page, limit }
 */
const getCatalog = (params = {}) => api.get('/products/catalog', { params })

/**
 * GET /categories (public)
 */
const getPublicCategories = () => api.get('/categories')

const catalogService = { getCatalog, getPublicCategories }
export default catalogService
