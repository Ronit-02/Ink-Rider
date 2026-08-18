import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '@/shared/components/ui/Button'
import StepInterests from '@/features/onboarding/pages/StepInterests'
import { useOnboardingOptions, useSaveOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { resetInferredInterests } from '@/features/onboarding/api/onboarding'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import useToast from '@/shared/hooks/useToast'

export default function SettingsPage() {
  const { notify } = useToast()
  const options = useOnboardingOptions()
  const save = useSaveOnboarding()
  const reset = useMutation({ mutationFn: resetInferredInterests, onSuccess: () => notify('Inferred interests reset.'), onError: () => notify('Inferred interests could not be reset.', { tone: 'error' }) })
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (options.data?.selectedTopicSlugs) setSelected(options.data.selectedTopicSlugs)
  }, [options.data])

  const toggle = slug => setSelected(current => current.includes(slug)
    ? current.filter(value => value !== slug)
    : [...current, slug])
  const saveTopics = () => save.mutate({ topicSlugs: selected, writerIds: [], completed: true })

  return (
    <main className="max-w-[820px] mx-auto px-5 md:px-8 pt-10 md:pt-12 pb-24">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Your account</p>
        <h1 className="mt-3 text-[clamp(30px,5vw,48px)] font-bold tracking-[-0.05em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
      </header>

      <section className="py-7 border-y border-[var(--color-border)]">
        <h2 className="text-[18px] font-semibold text-[var(--color-text)]">Reading interests</h2>
        <p className="mt-2 mb-6 text-[13px] leading-6 text-[var(--color-text-secondary)]">These explicit choices influence your For You feed. They are used for recommendations, not sold or used for advertising.</p>
        {options.isPending && <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
        {options.isError && <p role="alert" className="text-[13px] text-[var(--color-danger)]">Topics could not be loaded.</p>}
        {options.data && <StepInterests topics={options.data.topics} selected={selected} onToggle={toggle} />}
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={saveTopics} disabled={save.isPending || options.isPending}>{save.isPending ? 'Saving…' : 'Save interests'}</Button>
          {save.isSuccess && <span className="text-[12px] text-[var(--color-text-secondary)]">Saved</span>}
          {save.isError && <span role="alert" className="text-[12px] text-[var(--color-danger)]">Could not save</span>}
        </div>
      </section>

      <section className="py-7 border-b border-[var(--color-border)]">
        <h2 className="text-[18px] font-semibold text-[var(--color-text)]">Inferred interests</h2>
        <p className="mt-2 mb-5 text-[13px] leading-6 text-[var(--color-text-secondary)]">Ink Rider can learn from reading interactions. Resetting removes those learned weights without changing the topics you selected above.</p>
        <Button variant="secondary" onClick={() => reset.mutate()} disabled={reset.isPending}>{reset.isPending ? 'Resetting…' : 'Reset inferred interests'}</Button>
        {reset.isSuccess && <p className="mt-3 text-[12px] text-[var(--color-text-secondary)]">Inferred interests reset.</p>}
        {reset.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">Could not reset inferred interests.</p>}
      </section>
    </main>
  )
}
