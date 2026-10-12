import api from '../../../lib/api'

// ─── Cart Service ─────────────────────────────────────────────────────────────
const getCart = () => api.get('/cart')

const addItem = (productId, variantId, quantity) =>
  api.post('/cart/items', { productId, variantId, quantity })

const updateItem = (itemId, quantity) =>
  api.patch(`/cart/items/${itemId}`, { quantity })

const removeItem = (itemId) => api.delete(`/cart/items/${itemId}`)

const clearCart = () => api.delete('/cart')

const cartService = { getCart, addItem, updateItem, removeItem, clearCart }
export default cartService
