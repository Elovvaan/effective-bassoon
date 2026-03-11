/**
 * Returns true when a query-like value should be treated as a missing filter.
 */
export function isEmptyFilter(value: string | null | undefined): boolean {
  return value === undefined || value === null || value.trim().length === 0;
}
