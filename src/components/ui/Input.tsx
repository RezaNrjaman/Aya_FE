/** UI-003: Input — text input with label, helper, validation */
import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({ label, error, helper, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-dark-200">{label}</label>}
      <input
        id={inputId}
        className={clsx(
          'glass-input w-full px-3 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition',
          error && 'ring-2 ring-danger/50',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : helper ? <p className="text-xs text-dark-500">{helper}</p> : null}
    </div>
  )
}
