type NotificationTone = 'info' | 'success' | 'warning' | 'error'

type TimedNotificationProps = {
  title?: string
  message: string
  tone: NotificationTone
  durationMs: number
  isClosing: boolean
}

function TimedNotification ({
  title,
  message,
  tone,
  durationMs,
  isClosing
}: TimedNotificationProps) {
  return (
    <section
      className={[
        'timed-notification',
        `timed-notification--${tone}`,
        isClosing ? 'is-closing' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      role='status'
      aria-live='polite'
      aria-atomic='true'
    >
      <div className='timed-notification__content'>
        {title ? <p className='timed-notification__title'>{title}</p> : null}
        <p className='timed-notification__message'>{message}</p>
      </div>
      <div
        className='timed-notification__countdown'
        style={{ animationDuration: `${durationMs}ms` }}
      />
    </section>
  )
}

export default TimedNotification
