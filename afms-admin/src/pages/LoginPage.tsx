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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetTokenInput, setResetTokenInput] = useState('')
  const [resetTokenError, setResetTokenError] = useState('')

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  const handleOpenResetPassword = () => {
    setResetTokenInput('')
    setResetTokenError('')
    setIsResetModalOpen(true)
  }

  const handleCloseResetModal = () => {
    setIsResetModalOpen(false)
    setResetTokenInput('')
    setResetTokenError('')
  }

  const handleContinueToResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tokenValue = resetTokenInput.trim()

    if (tokenValue.length === 0) {
      setResetTokenError('Please enter your reset token.')
      return
    }

    handleCloseResetModal()
    navigate(`/reset-password/${encodeURIComponent(tokenValue)}`)
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

      {isResetModalOpen ? (
        <div
          className='alert-modal-overlay'
          role='presentation'
          onClick={handleCloseResetModal}
        >
          <section
            className='alert-modal'
            role='dialog'
            aria-modal='true'
            aria-label='Enter reset token'
            onClick={event => event.stopPropagation()}
          >
            <h3>Reset password</h3>
            <form onSubmit={handleContinueToResetPassword}>
              <label htmlFor='reset-token'>Reset token</label>
              <input
                id='reset-token'
                type='text'
                value={resetTokenInput}
                onChange={event => {
                  setResetTokenInput(event.target.value)
                  if (resetTokenError) {
                    setResetTokenError('')
                  }
                }}
                placeholder='Paste token from reset link email'
                autoComplete='off'
                required
              />

              {resetTokenError ? (
                <p className='login-error'>{resetTokenError}</p>
              ) : null}

              <div className='alert-modal-actions'>
                <button type='button' onClick={handleCloseResetModal}>
                  Cancel
                </button>
                <button type='submit'>Continue</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default LoginPage
