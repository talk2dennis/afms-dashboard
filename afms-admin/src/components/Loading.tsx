type LoadingProps = {
  isVisible: boolean
  message?: string
}

function Loading ({ isVisible, message = 'Loading...' }: LoadingProps) {
  if (!isVisible) {
    return null
  }

  return (
    <div className='loading-overlay' role='status' aria-live='assertive'>
      <div className='loading-overlay__card'>
        <span className='loading-overlay__spinner' aria-hidden='true' />
        <p>{message}</p>
      </div>
    </div>
  )
}

export default Loading
