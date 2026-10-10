// ─── Button Component ─────────────────────────────────────────────────────────
/**
 * Props:
 *  variant: 'primary' | 'outline' | 'ghost' | 'danger'
 *  size:    'sm' | 'md' | 'lg'
 *  loading: boolean
 *  fullWidth: boolean
 *  children, onClick, type, disabled, className
 */

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 ' +
    'text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed',
  outline:
    'bg-transparent border border-slate-600 text-slate-200 ' +
    'hover:border-violet-500 hover:bg-violet-500/10 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed',
  danger:
    'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 ' +
    'text-white shadow-lg shadow-red-500/25 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

const Spinner = () => (
  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-fast" />
)

const Button = ({
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  fullWidth  = false,
  children,
  onClick,
  type       = 'button',
  disabled   = false,
  className  = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-200 active:scale-[0.97] select-none',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size]       || SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export default Button
