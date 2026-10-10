import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { toast } from 'react-toastify'
import useAuth from '../hooks/UseAuth'
import Button from '../../../components/common/Button'
import authService from '../services/auth.service'

// ─── OTP Input Box ────────────────────────────────────────────────────────────
const OtpBox = ({ index, value, onChange, onKeyDown, inputRef }) => (
  <input
    ref={inputRef}
    id={`otp-box-${index}`}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(e, index)}
    onKeyDown={(e) => onKeyDown(e, index)}
    className="w-12 h-14 text-center text-2xl font-bold rounded-xl
               bg-slate-900 text-slate-100 border-2 border-slate-700
               focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
               outline-none transition-all duration-200 caret-violet-400
               selection:bg-violet-500/30"
  />
)

// ─── VerifyOtp Page ───────────────────────────────────────────────────────────
const VerifyOtp = () => {
  const { handleVerifyOtp, loading, error, dismissError } = useAuth()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const otpEmail = queryParams.get('email')

  const OTP_LENGTH = 6
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = Array.from({ length: OTP_LENGTH }, () => useRef(null))

  // Auto focus first box on mount
  useEffect(() => { refs[0]?.current?.focus() }, [])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  const handleChange = (e, idx) => {
    dismissError()
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    if (val && idx < OTP_LENGTH - 1) refs[idx + 1]?.current?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        refs[idx - 1]?.current?.focus()
      } else {
        const next = [...digits]
        next[idx] = ''
        setDigits(next)
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs[idx - 1]?.current?.focus()
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) refs[idx + 1]?.current?.focus()
  }

  // Handle paste (e.g. from SMS)
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    refs[Math.min(pasted.length, OTP_LENGTH - 1)]?.current?.focus()
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < OTP_LENGTH) {
      toast.warning('Please enter the complete 6-digit OTP')
      return
    }
    handleVerifyOtp({ email: otpEmail, otp })
  }

  const handleResend = async () => {
    if (countdown > 0 || !otpEmail) return
    setResending(true)
    try {
      await authService.resendOtp(otpEmail)
      toast.success('OTP resent! Check your email.')
      setCountdown(60)
      setDigits(Array(OTP_LENGTH).fill(''))
      refs[0]?.current?.focus()
    } catch {
      toast.error('Failed to resend OTP. Try again.')
    } finally {
      setResending(false)
    }
  }

  const filled = digits.filter(Boolean).length

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.18) 0%, transparent 70%),' +
          '#0f172a',
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-up">

        {/* Logo */}
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

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/25
                          flex items-center justify-center text-3xl">
            📧
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 text-center mb-1">
          Verify your email
        </h1>
        <p className="text-sm text-slate-500 text-center mb-2">
          We sent a 6-digit OTP to
        </p>
        {otpEmail && (
          <p className="text-sm font-semibold text-violet-400 text-center mb-6">
            {otpEmail}
          </p>
        )}
        {!otpEmail && (
          <p className="text-sm text-slate-500 text-center mb-6">your email address</p>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10
                          border border-red-500/25 text-red-400 text-sm font-medium mb-5">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={onSubmit} id="verify-otp-form" onPaste={handlePaste}>
          {/* OTP Boxes */}
          <div className="flex gap-2 justify-center mb-6">
            {digits.map((d, i) => (
              <OtpBox
                key={i}
                index={i}
                value={d}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputRef={refs[i]}
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1 justify-center mb-6">
            {digits.map((d, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-all duration-300 ${d ? 'bg-violet-500' : 'bg-slate-700'
                  }`}
              />
            ))}
          </div>

          <Button
            id="verify-otp-submit"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={filled < OTP_LENGTH}
          >
            {!loading && 'Verify OTP'}
          </Button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 mb-1">Didn&apos;t receive the code?</p>
          {countdown > 0 ? (
            <p className="text-sm text-slate-400">
              Resend in{' '}
              <span className="text-violet-400 font-semibold tabular-nums">
                0:{countdown.toString().padStart(2, '0')}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-violet-400 font-semibold hover:text-cyan-400
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p className="text-sm text-slate-500 text-center mt-4">
          Wrong account?{' '}
          <Link to="/register" className="text-violet-400 font-semibold hover:text-cyan-400 transition-colors">
            Go back
          </Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyOtp
