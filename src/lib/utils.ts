import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function daysUntil(date: string | Date): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export type Tone = 'success' | 'warning' | 'danger'

/** Compliance bands used across the product: ≥80 healthy, 60–79 attention, <60 critical. */
export function complianceTone(value: number): Tone {
  if (value >= 80) return 'success'
  if (value >= 60) return 'warning'
  return 'danger'
}

export const toneText: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

export const toneFill: Record<Tone, string> = {
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
}

export function percentageColor(value: number): string {
  return toneText[complianceTone(value)]
}
