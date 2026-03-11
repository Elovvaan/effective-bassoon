export interface ColumnDefinition<T> {
  key: keyof T;
  label: string;
}

/**
 * Build a stable display string for table-like rows where values are primitives.
 */
export function toDisplayRow<T extends Record<string, string | number | boolean>>(row: T): string {
  return Object.values(row)
    .map((value) => String(value))
    .join(' | ');
}
