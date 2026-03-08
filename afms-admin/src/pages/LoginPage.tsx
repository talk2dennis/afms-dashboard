import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import { useUiFeedback } from '../context/UiFeedbackContext'

function LoginPage () {
  const navigate = useNavigate()
  const { isAuthenticated, signIn } = useAuth()
  const { withLoading, notify } = useUiFeedback()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  const handleOpenResetPassword = () => {
    const token = window.prompt('Paste your password reset token')?.trim()

    if (!token) {
      return
    }

    navigate(`/auth/reset-password/${encodeURIComponent(token)}`)
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emailValue = loginEmail.trim().toLowerCase()
    const passwordValue = loginPassword.trim()

    try {
      setIsLoggingIn(true)
      const response = await withLoading(
        async () =>
          apiClient.post('/auth/admin/login', {
            email: emailValue,
            password: passwordValue
          }),
        'Signing you in...'
      )

      signIn(response.data.user, response.data.token)
      setLoginError('')
      notify({
        tone: 'success',
        title: 'Login successful',
        message: `Welcome back, ${response.data.user.name ?? 'Admin'}.`
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message)
        notify({
          tone: 'error',
          title: 'Login failed',
          message: error.message
        })
      } else {
        setLoginError('Unable to login at the moment')
        notify({
          tone: 'error',
          title: 'Login failed',
          message: 'Unable to login at the moment'
        })
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

          <button
            type='button'
            className='login-reset-link'
            onClick={handleOpenResetPassword}
          >
            Reset password with token
          </button>

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
