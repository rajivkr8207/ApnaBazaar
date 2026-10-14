import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import useAuth from '../hooks/UseAuth'
import InputField from '../../../components/common/Inputfield'
import Button from '../../../components/common/Button'

// ─── Auth Card Wrapper ────────────────────────────────────────────────────────
const AuthCard = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950"
    style={{
      background:
        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.18) 0%, transparent 70%),' +
        'radial-gradient(ellipse 60% 40% at 100% 90%, rgba(6,182,212,0.1) 0%, transparent 60%),' +
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

// ─── Login Page ───────────────────────────────────────────────────────────────
const Login = () => {
  const { handleLogin, loading, error, dismissError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { identifier: '', password: '' } })

  const onSubmit = (data) => {
    handleLogin(data)
  }

  return (
    <AuthCard>
      <Logo />

      <h1 className="text-2xl font-bold text-slate-100 text-center mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500 text-center mb-7">
        Sign in to your account to continue
      </p>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10
                        border border-red-500/25 text-red-400 text-sm font-medium mb-5">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} id="login-form" className="flex flex-col gap-4">
        <InputField
          id="login-identifier"
          label="Email address/ username"
          type="text"
          placeholder="you@example.com or @username"
          autoComplete="identifier"
          error={errors.identifier?.message}
          {...register('identifier', {
            required: 'Email or username is required',
            onChange: () => dismissError(),
          })}
        />

        <InputField
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            onChange: () => dismissError(),
          })}
        />

        <Button
          id="login-submit"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          className="mt-1"
        >
          {!loading && 'Sign In'}
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-violet-400 font-semibold hover:text-cyan-400 transition-colors">
          Create one
        </Link>
      </p>
    </AuthCard>
  )
}

export default Login
