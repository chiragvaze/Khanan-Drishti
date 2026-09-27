import React, { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useDialog } from '../../lib/useDialog'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'sm:max-w-[440px]',
  md: 'sm:max-w-[560px]',
  lg: 'sm:max-w-[720px]',
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md', className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  useDialog(isOpen, onClose, panelRef)

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-overlay backdrop-blur-[2px] animate-fade-in-backdrop" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface-raised shadow-pop animate-pop-in focus:outline-none sm:max-h-[85vh]',
          sizes[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[16px] font-semibold leading-6 text-text-primary">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-[13px] text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-2 px-5 py-3 sm:flex-row sm:justify-end">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  )
}
