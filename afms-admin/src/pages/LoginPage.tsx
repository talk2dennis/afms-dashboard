import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

function LoginPage () {
  const navigate = useNavigate()
  const { isAuthenticated, signIn } = useAuth()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emailValue = loginEmail.trim().toLowerCase()
    const passwordValue = loginPassword.trim()

    try {
      setIsLoggingIn(true)
      const response = await apiClient.post('/auth/login', {
        email: emailValue,
        password: passwordValue
      })

      signIn(response.data.user, response.data.token)
      setLoginError('')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message)
      } else {
        setLoginError('Unable to login at the moment')
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <main className='login-page'>
      <section className='login-card' aria-label='Admin login'>
        <h1>Flood Reporting Admin</h1>
        <p>Sign in to review local flood reports and manage approvals.</p>

        <form className='login-form' onSubmit={handleLogin}>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            type='email'
            value={loginEmail}
            onChange={event => setLoginEmail(event.target.value)}
            placeholder='admin@flood.local'
            required
          />

          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type='password'
            value={loginPassword}
            onChange={event => setLoginPassword(event.target.value)}
            placeholder='Enter password'
            required
          />

          {loginError ? <p className='login-error'>{loginError}</p> : null}

          <button type='submit' disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className='login-hint'>Use your admin credentials to continue.</p>
      </section>
    </main>
  )
}

export default LoginPage
