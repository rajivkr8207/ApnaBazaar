import { useEffect } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import AppRouter from "../routes/app.routes.jsx"
import { store } from "./store"
import { ToastContainer } from "react-toastify"
import { fetchProfile } from "../features/auth/auth.thunk"
import { fetchCart } from "../features/store/cart.thunk"
import { selectIsAuthenticated, selectIsInitialized } from "../features/auth/auth.slice"

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isInitialized = useSelector(selectIsInitialized)

  useEffect(() => {
    // Verify session with getProfile on page load / refresh
    dispatch(fetchProfile())
  }, [dispatch])

  // Load cart once user session is confirmed
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [dispatch, isInitialized, isAuthenticated])

  return children
}

const App = () => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Provider>
  )
}

export default App