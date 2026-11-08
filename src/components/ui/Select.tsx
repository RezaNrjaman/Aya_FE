/** UI-003: Select — dropdown with glass styling */
import { clsx } from 'clsx'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, id, className, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-dark-200">{label}</label>}
      <select
        id={selectId}
        className={clsx('glass-input w-full px-3 py-2 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition', error && 'ring-2 ring-danger/50', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
