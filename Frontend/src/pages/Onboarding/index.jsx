import { useState } from 'react'
import { colors, fonts, fontSizes, transitions } from '@/styles/tokens'
import Button from '@/components/ui/Button'
import useAuth from '@/hooks/useAuth'
import StepInterests from './StepInterests'
import StepFollow from './StepFollow'
import StepFeatures from './StepFeatures'

const STEPS = [
  {
    id: 1,
    title: 'Pick your interests',
    subtitle: "We'll use this to tailor your reading experience.",
  },
  {
    id: 2,
    title: 'Follow writers',
    subtitle: 'Follow at least 3 writers to personalise your feed.',
  },
  {
    id: 3,
    title: 'Discover features',
    subtitle: 'Ink Rider has a few tricks up its sleeve.',
  },
]

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            flex: 1,
            borderRadius: 999,
            background: i < current ? colors.accent : colors.border,
            transition: transitions.default,
          }}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [interests, setInterests] = useState([])
  const [followed, setFollowed] = useState([])
  const { completeOnboarding } = useAuth()

  const toggleInterest = (item) =>
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    )

  const toggleFollow = (id) =>
    setFollowed((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const currentStep = STEPS[step - 1]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Wordmark */}
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: fontSizes['2xl'],
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 48,
            letterSpacing: '-0.5px',
          }}
        >
          Ink Rider
        </p>

        {/* Progress */}
        <ProgressBar current={step} total={STEPS.length} />

        <p style={{ fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: 4 }}>
          Step {step} of {STEPS.length}
        </p>

        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: fontSizes['2xl'],
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: '-0.4px',
          }}
        >
          {currentStep.title}
        </h2>
        <p style={{ fontSize: fontSizes.base, color: colors.textSecondary, marginBottom: 28 }}>
          {currentStep.subtitle}
        </p>

        {/* Step content */}
        <div style={{ marginBottom: 40 }}>
          {step === 1 && <StepInterests selected={interests} onToggle={toggleInterest} />}
          {step === 2 && <StepFollow selected={followed} onToggle={toggleFollow} />}
          {step === 3 && <StepFeatures />}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="ghost"
            onClick={completeOnboarding}
            style={{ color: colors.textMuted }}
          >
            Skip
          </Button>

          <Button
            variant="primary"
            onClick={() => (step < STEPS.length ? setStep((s) => s + 1) : completeOnboarding())}
          >
            {step === STEPS.length ? 'Get Started' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
