// Theme-aware chart primitives. Recharts accepts CSS variables in SVG
// presentation attributes, so charts re-colour instantly when the theme changes.

export const chartColors = {
  accent: 'var(--color-accent)',
  danger: 'var(--color-danger-solid)',
  warning: 'var(--color-warning-solid)',
  success: 'var(--color-success-solid)',
  info: 'var(--color-info-solid)',
  neutral: 'var(--color-neutral-strong)',
  grid: 'var(--color-chart-grid)',
  axis: 'var(--color-chart-axis)',
  track: 'var(--color-chart-track)',
  surface: 'var(--color-surface)',
} as const

export const riskColor = {
  HIGH: chartColors.danger,
  MEDIUM: chartColors.warning,
  LOW: chartColors.success,
} as const

export const axisTick = { fontSize: 11, fill: chartColors.axis }

export const axisProps = {
  tick: axisTick,
  axisLine: false,
  tickLine: false,
} as const

export const gridProps = {
  strokeDasharray: '0',
  stroke: chartColors.grid,
  vertical: false,
} as const

export const tooltipCursor = { fill: 'var(--color-chart-track)', opacity: 0.6 }
