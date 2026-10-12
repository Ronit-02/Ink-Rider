import useAuth from '@/features/auth/hooks/useAuth'

export default function SignInPrompt({ message }: { message: string }) {
  const { signIn } = useAuth()
  return <section className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center" aria-label="Sign in required">
    <p className="text-[14px] max-w-full break-words text-[var(--color-text-secondary)]">{message}</p>
    <button type="button" onClick={signIn} style={{ color: 'var(--color-text-inverted)' }} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-[13px] font-semibold">Sign In</button>
  </section>
}
