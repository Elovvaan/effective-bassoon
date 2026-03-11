import type { AnalyticsSummary } from '@packages/types'

import { useAnalytics } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'

const scopeData: AnalyticsSummary[] = [
  { scope: 'class', activeUsers: 29, completionRate: 81, averageScore: 84 },
  { scope: 'school', activeUsers: 611, completionRate: 76, averageScore: 79 },
  { scope: 'district', activeUsers: 1830, completionRate: 74, averageScore: 78 },
]

export function AnalyticsPage() {
  const { session } = useAuth()
  const { data, isLoading, error } = useAnalytics(session)

  return (
    <section>
      <h1>Analytics</h1>
      {isLoading ? <p>Loading analytics...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {data ? (
        <ul>
          <li>Active users: {data.activeUsers}</li>
          <li>Completion rate: {data.completionRate}%</li>
        </ul>
      ) : null}

      <h2>Scope Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Scope</th>
            <th>Active Users</th>
            <th>Completion</th>
            <th>Average Score</th>
          </tr>
        </thead>
        <tbody>
          {scopeData.map((item) => (
            <tr key={item.scope}>
              <td>{item.scope}</td>
              <td>{item.activeUsers}</td>
              <td>{item.completionRate}%</td>
              <td>{item.averageScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
