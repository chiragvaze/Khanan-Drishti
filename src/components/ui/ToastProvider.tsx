import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastStyle: Record<ToastType, { Icon: typeof Info; icon: string; rail: string }> = {
  success: { Icon: CheckCircle2, icon: 'text-success', rail: 'bg-success-solid' },
  error: { Icon: AlertCircle, icon: 'text-danger', rail: 'bg-danger-solid' },
  warning: { Icon: AlertTriangle, icon: 'text-warning', rail: 'bg-warning-solid' },
  info: { Icon: Info, icon: 'text-info', rail: 'bg-info-solid' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (options: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { ...options, id, type: options.type || 'info', duration: options.duration || 5000 }

      setToasts((prev) => [...prev, newToast])

      if (newToast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed bottom-10 right-0 z-[80] flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-8"
      >
        {toasts.map((toast) => {
          const style = toastStyle[toast.type || 'info']
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-border bg-surface-raised py-3 pl-4 pr-3 shadow-pop animate-pop-in"
            >
              <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-[3px]', style.rail)} />
              <style.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.icon)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-text-primary">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-[12px] text-text-secondary">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text-primary"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
