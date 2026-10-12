# ApnaBazaar — Frontend

> A modern, dark-theme React + Vite + Tailwind CSS frontend for the ApnaBazaar marketplace platform.

---

## ✨ Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | [React 19](https://react.dev) + [Vite 8](https://vitejs.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`) |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org) + [React-Redux](https://react-redux.js.org) |
| Routing | [React Router v8](https://reactrouter.com) |
| HTTP Client | [Axios](https://axios-http.com) (with interceptors) |
| Notifications | [React Toastify](https://fkhadra.github.io/react-toastify) |
| Payments | [React Razorpay](https://github.com/razorpay/razorpay-web) |

---

## 📁 File & Folder Structure

```
frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env                          ← Create from .env.example
│
└── src/
    │
    ├── app/                      ← App-level setup
    │   ├── main.jsx              ← React entry point
    │   ├── App.jsx               ← Provider + Router + Toast wrapper
    │   ├── store.js              ← Redux configureStore (all reducers)
    │   └── index.css             ← Tailwind import + global resets + keyframes
    │
    ├── config/
    │   └── config.js             ← Env vars (API URL, app name, mode)
    │
    ├── constants/
    │   └── roles.js              ← ROLES, ROLE_HIERARCHY, ROLE_LABELS
    │
    ├── theme/                    ← Design-token JS objects (importable anywhere)
    │   ├── colors.js             ← Brand palette (primary, accent, neutrals, semantic)
    │   ├── typography.js         ← Font families, sizes, weights, line-heights
    │   ├── spacing.js            ← Spacing scale, border-radius, breakpoints
    │   └── theme.js              ← Unified theme export (colors + typography + spacing + shadows)
    │
    ├── lib/
    │   └── api.js                ← Axios instance (baseURL, auth header, 401 logout interceptor)
    │
    ├── routes/
    │   ├── app.routes.js         ← <BrowserRouter> + all <Routes> definition
    │   └── Protected.js          ← ProtectedRoute (role-based) + GuestRoute
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button.jsx        ← Reusable Button (primary/outline/ghost/danger, sm/md/lg, loading)
    │   │   └── Inputfield.jsx    ← Reusable InputField (label, error, all HTML input props)
    │   │
    │   └── layout/
    │       └── Sidebar.jsx       ← Collapsible sidebar with active-link highlighting
    │
    ├── features/
    │   └── auth/                 ← Auth feature module (self-contained)
    │       ├── auth.slice.js     ← Redux slice: state, async thunks, selectors
    │       ├── services/
    │       │   └── auth.service.js   ← Axios calls: register, login, verifyOtp, logout, profile
    │       ├── hooks/
    │       │   └── UseAuth.js        ← useAuth() — all auth actions + toast + navigate
    │       └── pages/
    │           ├── Login.jsx         ← Login page
    │           ├── Register.jsx      ← Register page (with role selector)
    │           ├── VerifyOtp.jsx     ← 6-box OTP input with countdown resend
    │           └── Profile.jsx       ← Profile view + inline edit + avatar upload
    │
    └── utils/                    ← Shared utility functions (add as needed)
```

---

## 🔐 Auth Flow

```
Register ──► VerifyOtp ──► Dashboard
  │                             ▲
  │                             │
Login  ────────────────────────►┘
```

1. **Register** → POST `/auth/register` → slice sets `otpEmail` → redirect `/verify-otp`
2. **VerifyOtp** → POST `/auth/verify-otp` → slice sets `user`, `token`, `isAuthenticated` → redirect `/dashboard`
3. **Login** → POST `/auth/login` → same as step 2
4. **Logout** → POST `/auth/logout` → clears Redux state → redirect `/login`

---

## 🗂️ Redux State

### `state.auth`

| Field | Type | Description |
|---|---|---|
| `user` | `object \| null` | Authenticated user object |
| `token` | `string \| null` | JWT access token |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `loading` | `boolean` | Any async operation in progress |
| `error` | `string \| null` | Last error message |
| `otpEmail` | `string \| null` | Email pending OTP verification |

### Available Selectors

```js
import {
  selectUser, selectToken, selectIsAuthenticated,
  selectAuthLoading, selectAuthError, selectOtpEmail,
} from '../features/auth/auth.slice'
```

### Available Thunks

```js
import {
  loginUser, registerUser, verifyOtp,
  logoutUser, fetchProfile, updateProfile,
} from '../features/auth/auth.slice'
```

---

## 🛡️ Route Protection

```jsx
// In app.routes.js

// Guest-only (redirects logged-in users to /dashboard)
<Route element={<GuestRoute />}>
  <Route path="/login"      element={<Login />} />
  <Route path="/register"   element={<Register />} />
  <Route path="/verify-otp" element={<VerifyOtp />} />
</Route>

// Requires login
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile"   element={<Profile />} />
</Route>

// Requires specific role
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/admin" element={<AdminPanel />} />
</Route>
```

---

## 🎨 Design System

### Theme Tokens (JS)

```js
import theme from './theme/theme'

theme.colors.primary[500]     // #7c3aed  (violet)
theme.colors.accent[500]      // #06b6d4  (cyan)
theme.colors.surface.bg       // #0f172a  (dark bg)
theme.typography.fontSize.xl  // 1.25rem
theme.shadows.glow            // violet glow shadow
```

### Roles

```js
import { ROLES, ROLE_LABELS, ROLE_HIERARCHY } from './constants/roles'

ROLES.ADMIN   // 'admin'
ROLES.SELLER  // 'seller'
ROLES.BUYER   // 'buyer'
ROLES.GUEST   // 'guest'
```

### Reusable Components

```jsx
// Button — variant, size, loading, fullWidth
<Button variant="primary" size="lg" fullWidth loading={isLoading}>
  Submit
</Button>

// InputField — label, error, all input props
<InputField
  id="email"
  name="email"
  label="Email address"
  type="email"
  placeholder="you@example.com"
  value={form.email}
  onChange={onChange}
  error={errors.email}
  required
/>
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

```env
VITE_BACKEND_API_URL=http://localhost:5000/api
VITE_APP_NAME=ApnaBazaar
VITE_APP_MODE=development
```

### 3. Start dev server

```bash
npm run dev
```

App runs at **http://localhost:5173**

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 🔌 API Integration

The Axios instance (`src/lib/api.js`) automatically:
- Attaches `Authorization: Bearer <token>` from Redux state on every request
- Dispatches `logout()` on **401 Unauthorized** responses
- Logs request/response in development mode

```js
import api from '../lib/api'

// Use in services:
const { data } = await api.post('/auth/login', credentials)
const { data } = await api.get('/products')
```

---

## 🧩 Adding a New Feature

1. Create folder: `src/features/<feature-name>/`
2. Add sub-folders: `pages/`, `components/`, `hooks/`, `services/`
3. Create `<feature>.slice.js` with Redux slice
4. Register reducer in `src/app/store.js`
5. Add routes in `src/routes/app.routes.js`

---

## 📦 Adding to Redux Store

```js
// src/app/store.js
import productReducer from '../features/products/product.slice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    products: productReducer,   // ← add here
  },
})
```
