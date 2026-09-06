import useToast from '@/shared/hooks/useToast'

const toneIcons = {
  success: '✓',
  error: '!',
  info: 'i',
}

export default function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="toast-viewport" aria-label="Action notifications">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
          <span className="toast__icon" aria-hidden="true">{toneIcons[toast.tone]}</span>
          <p className="toast__message">{toast.message}</p>
          <button type="button" className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</button>
        </div>
      ))}
    </div>
  )
}
