import React from 'react'
import { cn } from '../../lib/utils'
import { EmptyState, LoadingState } from './States'

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
  /** Right-align and use tabular figures. */
  numeric?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  onRowClick?: (item: T) => void
  getRowKey?: (item: T, index: number) => React.Key
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data available',
  className,
  onRowClick,
  getRowKey,
}: DataTableProps<T>) {
  if (isLoading) return <LoadingState message="Loading data…" />

  return (
    <div className={cn('kd-table-wrap', className)}>
      <table className="kd-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className={cn(col.numeric && 'kd-cell-num', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState compact title="Nothing to show" description={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                data-clickable={onRowClick ? 'true' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onRowClick(row)
                  }
                }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={cn(col.numeric && 'kd-cell-num', col.className)}>
                    {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.accessorKey as string] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
