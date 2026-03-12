import type { AnalyticsSummary } from '@packages/types'
import { Card, DataTable, EmptyState } from '@packages/ui'

import { useAnalytics } from '../api/hooks'
import { useApi } from '../hooks/useApi'
import { apiClient } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useRoleGuard } from '../hooks/useRoleGuard'

export function AnalyticsPage() {
  const { session } = useAuth()
  const { canAccess } = useRoleGuard(['district_admin', 'school_admin', 'teacher'])
  const summaryApi = useAnalytics(session)
  const classesApi = useApi(async () => (session ? apiClient.listClasses(session) : { items: [] }), [session])
  const schoolsApi = useApi(async () => (session ? apiClient.listSchools(session) : { items: [] }), [session])

  if (!canAccess) {
    return <EmptyState message="Analytics access required." />
  }

  const scopeRows: Array<AnalyticsSummary & { id: string }> = [
    { id: 'district', ...(summaryApi.data ?? { scope: 'district', activeUsers: 0, completionRate: 0, averageScore: 0 }) },
    { id: 'school', scope: 'school', activeUsers: schoolsApi.data?.items.length ?? 0, completionRate: summaryApi.data?.completionRate ?? 0, averageScore: summaryApi.data?.averageScore ?? 0 },
    { id: 'class', scope: 'class', activeUsers: classesApi.data?.items.length ?? 0, completionRate: summaryApi.data?.completionRate ?? 0, averageScore: summaryApi.data?.averageScore ?? 0 },
  ]

  return (
    <section data-testid="analytics-page">
      <h1 data-testid="analytics-title">Analytics</h1>
      {summaryApi.isLoading ? <p>Loading analytics...</p> : null}
      {summaryApi.error ? <p className="error">{summaryApi.error}</p> : null}

      <Card title="District-Level Metrics">
        <ul data-testid="district-metrics-list">
          <li>Active users: {summaryApi.data?.activeUsers ?? 0}</li>
          <li>Completion rate: {summaryApi.data?.completionRate ?? 0}%</li>
          <li>Average score: {summaryApi.data?.averageScore ?? 0}</li>
        </ul>
      </Card>

      <Card title="Scope Metrics Table">
        <div data-testid="scope-metrics-table">
          <DataTable<AnalyticsSummary & { id: string }>
            columns={[
              { key: 'scope', label: 'Scope' },
              { key: 'activeUsers', label: 'Active Users' },
              { key: 'completionRate', label: 'Completion %' },
              { key: 'averageScore', label: 'Average Score' },
            ]}
            rows={scopeRows}
          />
        </div>
      </Card>
    </section>
  )
}
