import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, isAuthenticated, session } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated && session) {
    if (session.user.role === 'teacher') return <Navigate to="/teacher" replace />
    if (session.user.role === 'student') return <Navigate to="/student" replace />
    return <Navigate to="/admin" replace />
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await login(email, password)
  }

  return (
    <div className="login-page">
      <h1>Education Platform Login</h1>
      <form onSubmit={(event) => void onSubmit(event)}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      <button type="button" onClick={() => navigate('/')}>Reset</button>
    </div>
  )
}
