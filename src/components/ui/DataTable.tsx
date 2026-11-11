/** UI-003: DataTable — generic table with loading/empty/error state */
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

function TableState({ children, variant = 'info' }: { children: ReactNode; variant?: 'info' | 'error' }) {
  return (
    <div className={clsx('glass-card flex items-center justify-center py-12 text-sm', variant === 'error' ? 'text-danger' : 'text-dark-400')}>
      {children}
    </div>
  )
}

function TableHead<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <thead>
      <tr className="border-b border-glass-border">
        {columns.map((c) => (
          <th key={c.key} className={clsx('px-4 py-3 font-medium text-dark-400 text-xs uppercase tracking-wider', c.className)}>
            {c.header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function TableRows<T>({ columns, data, keyExtractor }: { columns: Column<T>[]; data: T[]; keyExtractor: (r: T) => string }) {
  return (
    <tbody>
      {data.map((row) => (
        <tr key={keyExtractor(row)} className="border-b border-glass-border/50 hover:bg-white/[0.02] transition">
          {columns.map((c) => (
            <td key={c.key} className={clsx('px-4 py-3 text-dark-200', c.className)}>{c.render(row)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function DataTable<T>({ columns, data, keyExtractor, loading, error, emptyMessage = 'Tidak ada data.' }: { columns: Column<T>[]; data: T[] | null | undefined; keyExtractor: (row: T) => string; loading?: boolean; error?: string | null; emptyMessage?: string }) {
  // API list endpoints must ideally return [], but tolerate legacy/null responses
  // here as a final shared safety boundary for every table in the application.
  const safeData: T[] = Array.isArray(data) ? data : []
  if (loading) return <TableState>Memuat data...</TableState>
  if (error) return <TableState variant="error">{error}</TableState>
  if (safeData.length === 0) return <TableState>{emptyMessage}</TableState>
  return (
    <div className="overflow-x-auto rounded-xl glass-card">
      <table className="w-full text-sm text-left">
        <TableHead columns={columns} />
        <TableRows columns={columns} data={safeData} keyExtractor={keyExtractor} />
      </table>
    </div>
  )
}
