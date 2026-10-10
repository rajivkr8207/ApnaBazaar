import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/auth.slice'
import { injectStore } from '../lib/api'

// ─── Redux Store ──────────────────────────────────────────────────────────────
export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
})

injectStore(store)

export default store