import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import LoginModal from '../components/LoginModal'

const LoginPromptContext = createContext<() => void>(() => { throw new Error('LoginPromptProvider is required') })

export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [request, setRequest] = useState<{ key: string; returnTo: string } | null>(null)
  const open = useCallback(() => setRequest({ key: location.key, returnTo: `${location.pathname}${location.search}${location.hash}` }), [location])
  useEffect(() => {
    window.addEventListener('ink-rider:sign-in-required', open)
    return () => window.removeEventListener('ink-rider:sign-in-required', open)
  }, [open])
  return <LoginPromptContext.Provider value={open}>
    {children}
    {request?.key === location.key && <LoginModal returnTo={request.returnTo} onClose={() => setRequest(null)} />}
  </LoginPromptContext.Provider>
}

export default function useLoginPrompt() {
  return useContext(LoginPromptContext)
}
