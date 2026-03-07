import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import Loading from '../components/Loading'
import TimedNotification from '../components/TimedNotification'

export type NotificationTone = 'info' | 'success' | 'warning' | 'error'

type NotifyInput = {
  title?: string
  message: string
  tone?: NotificationTone
  durationMs?: number
}

type NotificationItem = {
  id: number
  title?: string
  message: string
  tone: NotificationTone
  durationMs: number
}

type UiFeedbackContextValue = {
  isLoading: boolean
  loadingMessage: string
  showLoading: (message?: string) => void
  hideLoading: () => void
  withLoading: <T>(task: () => Promise<T>, message?: string) => Promise<T>
  notify: (input: NotifyInput) => void
}

const DEFAULT_LOADING_MESSAGE = 'Please wait...'
const DEFAULT_NOTIFICATION_DURATION = 1000
const FADE_OUT_DURATION = 500

const UiFeedbackContext = createContext<UiFeedbackContextValue | null>(null)

type UiFeedbackProviderProps = {
  children: ReactNode
}

export const UiFeedbackProvider = ({ children }: UiFeedbackProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(DEFAULT_LOADING_MESSAGE)
  const [notificationQueue, setNotificationQueue] = useState<
    NotificationItem[]
  >([])
  const [activeNotification, setActiveNotification] =
    useState<NotificationItem | null>(null)
  const [isNotificationClosing, setIsNotificationClosing] = useState(false)

  const showLoading = useCallback((message?: string) => {
    setLoadingCount(previous => previous + 1)

    if (message) {
      setLoadingMessage(message)
      return
    }

    setLoadingMessage(previous => previous || DEFAULT_LOADING_MESSAGE)
  }, [])

  const hideLoading = useCallback(() => {
    setLoadingCount(previous => {
      if (previous <= 1) {
        setLoadingMessage(DEFAULT_LOADING_MESSAGE)
        return 0
      }

      return previous - 1
    })
  }, [])

  const withLoading: UiFeedbackContextValue['withLoading'] = useCallback(
    async (task, message) => {
      showLoading(message)

      try {
        return await task()
      } finally {
        hideLoading()
      }
    },
    [hideLoading, showLoading]
  )

  const notify = useCallback((input: NotifyInput) => {
    const notification: NotificationItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: input.title,
      message: input.message,
      tone: input.tone ?? 'info',
      durationMs: input.durationMs ?? DEFAULT_NOTIFICATION_DURATION
    }

    setNotificationQueue(previous => [...previous, notification])
  }, [])

  useEffect(() => {
    if (activeNotification || notificationQueue.length === 0) {
      return
    }

    const [next, ...rest] = notificationQueue
    setNotificationQueue(rest)
    setActiveNotification(next)
    setIsNotificationClosing(false)
  }, [activeNotification, notificationQueue])

  useEffect(() => {
    if (!activeNotification) {
      return
    }

    const closeAtMs = Math.max(
      activeNotification.durationMs - FADE_OUT_DURATION,
      0
    )

    const closeTimer = window.setTimeout(() => {
      setIsNotificationClosing(true)
    }, closeAtMs)

    const removeTimer = window.setTimeout(() => {
      setActiveNotification(null)
      setIsNotificationClosing(false)
    }, activeNotification.durationMs)

    return () => {
      window.clearTimeout(closeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [activeNotification])

  const value = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      loadingMessage,
      showLoading,
      hideLoading,
      withLoading,
      notify
    }),
    [
      hideLoading,
      loadingCount,
      loadingMessage,
      notify,
      showLoading,
      withLoading
    ]
  )

  return (
    <UiFeedbackContext.Provider value={value}>
      {children}
      <Loading isVisible={loadingCount > 0} message={loadingMessage} />
      <div className='notification-viewport' aria-live='polite'>
        {activeNotification ? (
          <TimedNotification
            title={activeNotification.title}
            message={activeNotification.message}
            tone={activeNotification.tone}
            durationMs={activeNotification.durationMs}
            isClosing={isNotificationClosing}
          />
        ) : null}
      </div>
    </UiFeedbackContext.Provider>
  )
}

export const useUiFeedback = (): UiFeedbackContextValue => {
  const context = useContext(UiFeedbackContext)

  if (!context) {
    throw new Error('useUiFeedback must be used within UiFeedbackProvider')
  }

  return context
}
