/** UI-003: Toast notification system */
import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; type: ToastType; message: string }
interface ToastContextValue { toast: (type: ToastType, message: string) => void }
const ToastContext = createContext<ToastContextValue | null>(null)

function useToastList() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])
  const remove = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])
  return { toasts, addToast, remove }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, remove } = useToastList()
  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info }

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICONS[toast.type]
  return (
    <div className={clsx(
      'glass-card flex items-center gap-3 px-4 py-3 text-sm animate-in slide-in-from-right',
      toast.type === 'success' && 'border-success/30',
      toast.type === 'error' && 'border-danger/30',
      toast.type === 'info' && 'border-info/30',
    )}>
      <Icon size={18} className={clsx({
        'text-success': toast.type === 'success',
        'text-danger': toast.type === 'error',
        'text-info': toast.type === 'info',
      })} />
      <span className="flex-1 text-dark-200">{toast.message}</span>
      <button onClick={onDismiss} className="text-dark-500 hover:text-dark-200"><X size={14} /></button>
    </div>
  )
}
