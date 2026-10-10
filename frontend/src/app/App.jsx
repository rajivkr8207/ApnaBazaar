import { Provider } from "react-redux"
import AppRouter from "../routes/app.routes.jsx"
import { store } from "./store"
import { ToastContainer } from "react-toastify"

const App = () => {
  return (
    <Provider store={store}>
      <AppRouter />
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