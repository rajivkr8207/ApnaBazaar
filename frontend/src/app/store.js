import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/auth.slice'
import categoryReducer from '../features/category/category.slice'
import productReducer from '../features/product/product.slice'
import cartReducer from '../features/store/cart.slice'
import orderReducer from '../features/store/order.slice'
import { injectStore } from '../lib/api'

// ─── Redux Store ──────────────────────────────────────────────────────────────
export const store = configureStore({
    reducer: {
        auth: authReducer,
        category: categoryReducer,
        product: productReducer,
        cart: cartReducer,
        order: orderReducer,
    },
})

injectStore(store)

export default store