import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { clsx } from 'clsx'

export interface SearchableOption { value: string; label: string }

interface SearchableSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  emptyMessage?: string
}

export function SearchableSelect({
  label, value, onChange, options, placeholder = 'Pilih data',
  searchPlaceholder = 'Cari nama...', disabled = false, required = false,
  error, emptyMessage = 'Data tidak ditemukan',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = options.find((option) => option.value === value)
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLocaleLowerCase().includes(q))
  }, [options, query])
  const visibleOptions = filtered.slice(0, 100)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setQuery('') }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    inputRef.current?.focus()
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-dark-200">{label}{required && <span className="text-danger ml-1">*</span>}</label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => { setOpen((current) => !current); setQuery('') }}
          className={clsx('glass-input w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40', disabled && 'opacity-50 cursor-not-allowed', error && 'ring-2 ring-danger/50')}
        >
          <span className={selected ? 'text-dark-100 truncate' : 'text-dark-500 truncate'}>{selected?.label ?? placeholder}</span>
          <ChevronDown size={15} className="shrink-0 text-dark-400" />
        </button>
        {open && !disabled && (
          <div className="absolute z-[80] mt-1 w-full rounded-lg border border-glass-border bg-dark-900 shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-glass-border relative">
              <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="glass-input w-full pl-8 pr-3 py-2 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <div role="listbox" className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-xs text-dark-500 text-center">{emptyMessage}</p>
              ) : visibleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => { onChange(option.value); setOpen(false); setQuery('') }}
                  className={clsx('w-full rounded-md px-3 py-2 text-left text-sm flex items-center justify-between gap-2 hover:bg-white/5', option.value === value ? 'text-brand-300 bg-brand-500/10' : 'text-dark-200')}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && <Check size={14} className="shrink-0" />}
                </button>
              ))}
              {filtered.length > visibleOptions.length && <p className="px-3 py-2 text-[11px] text-dark-500 text-center">Menampilkan 100 dari {filtered.length} hasil. Persempit pencarian untuk menemukan data lainnya.</p>}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
