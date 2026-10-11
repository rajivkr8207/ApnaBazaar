import { useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import AppRouter from "../routes/app.routes.jsx"
import { store } from "./store"
import { ToastContainer } from "react-toastify"
import { fetchProfile } from "../features/auth/auth.thunk"

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Verify session with getProfile on page load / refresh
    dispatch(fetchProfile())
  }, [dispatch])

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