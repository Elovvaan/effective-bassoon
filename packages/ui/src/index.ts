import { createElement, type ReactNode } from 'react'

export interface ColumnDefinition<T> {
  key: keyof T
  label: string
  render?: (row: T) => ReactNode
}

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  emptyLabel = 'No records found.',
}: {
  columns: Array<ColumnDefinition<T>>
  rows: T[]
  emptyLabel?: string
}) {
  if (rows.length === 0) {
    return createElement('p', null, emptyLabel)
  }

  return createElement(
    'table',
    null,
    createElement('thead', null, createElement('tr', null, ...columns.map((column) => createElement('th', { key: String(column.key) }, column.label)))),
    createElement('tbody', null, ...rows.map((row, index) => createElement('tr', { key: row.id ?? index }, ...columns.map((column) => createElement('td', { key: String(column.key) }, column.render ? column.render(row) : String(row[column.key] ?? '-')))))),
  )
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return createElement('section', { className: 'card' }, createElement('h2', null, title), children)
}

export function EmptyState({ message }: { message: string }) {
  return createElement('p', null, message)
}

export function toDisplayRow<T extends Record<string, string | number | boolean>>(row: T): string {
  return Object.values(row)
    .map((value) => String(value))
    .join(' | ')
}
