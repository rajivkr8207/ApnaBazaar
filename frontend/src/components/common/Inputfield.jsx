// ─── InputField Component ─────────────────────────────────────────────────────
/**
 * Props:
 *  id, name, label, type, placeholder, value, onChange,
 *  error (string), required, autoComplete, className
 */
const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  className = '',
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-400 tracking-wide"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className={[
          'w-full px-4 py-2.5 rounded-xl text-sm font-normal',
          'bg-slate-900 text-slate-100 placeholder-slate-500',
          'border transition-all duration-200 outline-none',
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
          className,
        ].join(' ')}
        {...rest}
      />

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default InputField
