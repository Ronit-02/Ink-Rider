/* OnboardingPage — multi-step interest/follow/features wizard */
import { useState } from 'react'
import Button from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'
import StepInterests from './StepInterests'
import StepFollow    from './StepFollow'
import StepFeatures  from './StepFeatures'

const STEPS = [
  { id: 1, title: 'Pick your interests',  subtitle: "We'll use this to tailor your reading experience." },
  { id: 2, title: 'Follow authors',       subtitle: 'Follow at least 3 authors to personalise your feed.' },
  { id: 3, title: 'Discover features',    subtitle: 'Ink Rider has a few tricks up its sleeve.' },
]

/* Progress bar — step segments */
function ProgressBar({ current, total }) {
  return (
    <div className="flex gap-[6px] mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-300
          ${i < current ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [step,      setStep]      = useState(1)
  const [interests, setInterests] = useState([])
  const [followed,  setFollowed]  = useState([])
  const { completeOnboarding } = useAuth()

  const toggleInterest = item =>
    setInterests(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])
  const toggleFollow = id =>
    setFollowed(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const current = STEPS[step - 1]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[520px]">

        {/* Wordmark */}
        <p className="font-bold text-[22px] text-center mb-12 tracking-[-0.5px] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}>Ink Rider</p>

        <ProgressBar current={step} total={STEPS.length} />

        <p className="text-[12px] text-[var(--color-text-muted)] mb-1">Step {step} of {STEPS.length}</p>
        <h2 className="font-bold text-[22px] tracking-[-0.4px] mb-2 text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}>{current.title}</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-7">{current.subtitle}</p>

        {/* Step content */}
        <div className="mb-10">
          {step === 1 && <StepInterests selected={interests} onToggle={toggleInterest} />}
          {step === 2 && <StepFollow    selected={followed}  onToggle={toggleFollow} />}
          {step === 3 && <StepFeatures />}
        </div>

        {/* Navigation row */}
        <div className="flex justify-between items-center">
          {step > 1
            ? <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>
            : <div />
          }
          <Button variant="ghost" onClick={completeOnboarding}
            className="text-[var(--color-text-muted)]">Skip</Button>
          <Button variant="primary"
            onClick={() => step < STEPS.length ? setStep(s => s + 1) : completeOnboarding()}>
            {step === STEPS.length ? 'Get Started' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
