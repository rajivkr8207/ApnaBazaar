import { useState } from 'react'
import { Link } from 'react-router'
import useAuth from '../hooks/UseAuth'
import InputField from '../../../components/common/Inputfield'
import Button from '../../../components/common/Button'
import { ROLES } from '../../../constants/roles'

// ─── Auth Card ────────────────────────────────────────────────────────────────
const AuthCard = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-12"
    style={{
      background:
        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.18) 0%, transparent 70%),' +
        'radial-gradient(ellipse 60% 40% at 0% 90%, rgba(6,182,212,0.1) 0%, transparent 60%),' +
        '#0f172a',
    }}>
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-up">
      {children}
    </div>
  </div>
)

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <div className="flex items-center justify-center gap-2.5 mb-7">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl
                    bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/40 animate-glow">
      🛍️
    </div>
    <span className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300
                     bg-clip-text text-transparent tracking-tight">
      ApnaBazaar
    </span>
  </div>
)

// ─── Role Card (buyer / seller selector) ─────────────────────────────────────
const RoleCard = ({ role, selected, label, desc, icon, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(role)}
    className={[
      'flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200',
      'text-sm font-semibold cursor-pointer select-none',
      selected
        ? 'border-violet-500 bg-violet-500/10 text-violet-300'
        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500',
    ].join(' ')}
  >
    <span className="text-2xl">{icon}</span>
    <span>{label}</span>
    <span className={`text-xs font-normal ${selected ? 'text-violet-400' : 'text-slate-500'}`}>{desc}</span>
  </button>
)

// ─── Register Page ────────────────────────────────────────────────────────────
const Register = () => {
  const { handleRegister, loading, error, dismissError } = useAuth()

  const [form, setForm] = useState({
    fullName: '',
    userName: '',
    email: '',
    mobile: '',
    password: '',
    role: ROLES.BUYER,
  })

  const onChange = (e) => {
    dismissError()
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    handleRegister(form)
  }

  return (
    <AuthCard>
      <Logo />

      <h1 className="text-2xl font-bold text-slate-100 text-center mb-1">
        Create an account
      </h1>
      <p className="text-sm text-slate-500 text-center mb-7">
        Join thousands of buyers and sellers today
      </p>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10
                        border border-red-500/25 text-red-400 text-sm font-medium mb-5">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={onSubmit} id="register-form" className="flex flex-col gap-4">

        <InputField
          id="reg-fullName"
          name="fullName"
          label="Full name"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={onChange}
          required
          autoComplete="fullname"
        />

        {/* Email */}
        <InputField
          id="reg-email"
          name="email"
          label="Username"
          placeholder="@email"
          value={form.email}
          onChange={onChange}
          required
          autoComplete="email"
        />
        <InputField
          id="reg-username"
          name="username"
          label="Username"
          placeholder="@username"
          value={form.username}
          onChange={onChange}
          required
          autoComplete="username"
        />

        {/* Password */}
        <InputField
          id="reg-password"
          name="password"
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={onChange}
          required
          autoComplete="new-password"
        />
        <InputField
          id="reg-mobile"
          name="mobile"
          label="Mobile Number"
          placeholder="1234567890"
          value={form.mobile}
          onChange={onChange}
          required
          autoComplete="mobile"
        />

        {/* Role Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-400">I want to…</span>
          <div className="flex gap-3">
            <RoleCard
              role={ROLES.BUYER}
              selected={form.role === ROLES.BUYER}
              label="Buy"
              desc="Shop products"
              icon="🛒"
              onSelect={(r) => { dismissError(); setForm((p) => ({ ...p, role: r })) }}
            />
            <RoleCard
              role={ROLES.SELLER}
              selected={form.role === ROLES.SELLER}
              label="Sell"
              desc="List products"
              icon="🏪"
              onSelect={(r) => { dismissError(); setForm((p) => ({ ...p, role: r })) }}
            />
          </div>
        </div>

        <Button
          id="register-submit"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          className="mt-1"
        >
          {!loading && 'Create Account'}
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-violet-400 font-semibold hover:text-cyan-400 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}

export default Register
