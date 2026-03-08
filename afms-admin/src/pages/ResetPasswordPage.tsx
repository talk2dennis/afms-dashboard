import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import apiClient from '../api/client'
import { useUiFeedback } from '../context/UiFeedbackContext'

function ResetPasswordPage () {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { withLoading, notify } = useUiFeedback()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const passwordValue = password.trim()
    const confirmPasswordValue = confirmPassword.trim()

    if (!token) {
      const message = 'Invalid or missing reset token.'
      setFormError(message)
      notify({
        tone: 'error',
        title: 'Reset link invalid',
        message
      })
      return
    }

    if (passwordValue.length < 6) {
      const message = 'Password must be at least 6 characters long.'
      setFormError(message)
      return
    }

    if (passwordValue !== confirmPasswordValue) {
      const message = 'Passwords do not match.'
      setFormError(message)
      return
    }

    try {
      setIsSubmitting(true)
      await withLoading(
        async () =>
          apiClient.post(`/auth/reset-password/${token}`, {
            password: passwordValue,
            confirmPassword: confirmPasswordValue
          }),
        'Resetting your password...'
      )

      setFormError('')
      notify({
        tone: 'success',
        title: 'Password updated',
        message: 'Your password has been reset successfully. Please sign in.'
      })
      navigate('/login', { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to reset password right now.'

      setFormError(message)
      notify({
        tone: 'error',
        title: 'Password reset failed',
        message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='login-page'>
      <section className='login-card' aria-label='Reset password'>
        <h1>Reset Password</h1>
        <p>Enter your new password to complete your account recovery.</p>

        <form className='login-form' onSubmit={handleResetPassword}>
          <label htmlFor='new-password'>New Password</label>
          <input
            id='new-password'
            type='password'
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder='Enter new password'
            autoComplete='new-password'
            required
          />

          <label htmlFor='confirm-password'>Confirm Password</label>
          <input
            id='confirm-password'
            type='password'
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            placeholder='Confirm new password'
            autoComplete='new-password'
            required
          />

          {formError ? <p className='login-error'>{formError}</p> : null}

          <button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Updating password...' : 'Reset Password'}
          </button>
        </form>

        <p className='login-hint'>
          Remembered your password? <Link to='/login'>Back to login</Link>
        </p>
      </section>
    </main>
  )
}

export default ResetPasswordPage
