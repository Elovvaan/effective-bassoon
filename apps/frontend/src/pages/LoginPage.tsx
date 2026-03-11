import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../types'

const roleOptions: UserRole[] = ['district_admin', 'school_admin', 'teacher', 'student']

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('district_admin')
  const { login, isLoading, error, isAuthenticated, session } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated && session) {
    if (session.user.role === 'teacher') return <Navigate to="/teacher" replace />
    if (session.user.role === 'student') return <Navigate to="/student" replace />
    return <Navigate to="/admin" replace />
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await login(username, password, role)

    if (role === 'teacher') navigate('/teacher')
    else if (role === 'student') navigate('/student')
    else navigate('/admin')
  }

  return (
    <div className="login-page">
      <h1>Education Platform Login</h1>
      <form onSubmit={(event) => void onSubmit(event)}>
        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="role">Role</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          {roleOptions.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </div>
  )
}
