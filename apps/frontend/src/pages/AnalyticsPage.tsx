import { useAnalytics } from '../api/hooks'
import { useAuth } from '../auth/AuthContext'

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
    </section>
  )
}
