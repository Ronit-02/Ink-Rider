import { useSelector } from 'react-redux'
import SignInPrompt from '@/shared/components/ui/SignInPrompt'

export default function PrivateRoute({ children, message = 'Sign in to access this page.', fullScreen = false }) {
    const user = useSelector(state => state.auth.user)
    const isReady = useSelector(state => state.auth.isReady)

    if (!isReady) {
        return <main role="status" className="min-h-[40vh] flex items-center justify-center text-[13px] text-[var(--color-text-muted)]">Restoring your session…</main>
    }

    if (!user) {
        return <main className={`flex flex-col px-4 py-6 ${fullScreen ? 'min-h-[100dvh]' : 'min-h-full'}`}>
            <SignInPrompt message={message} />
        </main>
    }

    return children
}
