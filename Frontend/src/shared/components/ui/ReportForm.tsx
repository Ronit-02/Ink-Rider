import { useId, useState } from 'react'
import Button from './Button'
import type { ReportSubject } from './ReportModal'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or deceptive content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate', label: 'Hateful content' },
  { value: 'toxicity', label: 'Toxic or abusive content' },
  { value: 'plagiarism', label: 'Plagiarism' },
  { value: 'misinformation', label: 'Potential misinformation' },
  { value: 'other', label: 'Something else' },
]

type Props = {
  subject: ReportSubject
  mutation: { isPending: boolean; isSuccess: boolean; isError: boolean; mutate: (input: { reason: string; details: string }) => void }
  onClose: () => void
}

export default function ReportForm({ subject, mutation, onClose }: Props) {
  const id = useId()

  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const handleSubmit = () => {
    if (!reason || mutation.isPending) return
    mutation.mutate({ reason, details })
  }

  if (mutation.isSuccess) {
    return (
      <section aria-live="polite">
        <h2 className="font-semibold text-[14px] text-(--color-text) mb-1">Report received</h2>
        <p className="text-[13px] text-(--color-text-secondary) mb-4">
          Our moderation queue will review this {subject}.
        </p>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </section>
    )
  }

  return (
    <section>
      <p className="mb-4 text-[12px] text-(--color-text-secondary)">Reports are private and help the moderation team review harmful content.</p>

      <label htmlFor={`${id}-reason`} className="block text-[12px] font-semibold text-(--color-text) mb-2">Reason</label>
      <select
        id={`${id}-reason`}
        value={reason}
        onChange={event => setReason(event.target.value)}
        className="w-full px-3 py-2.5 rounded-[10px] border border-(--color-border) bg-(--color-surface)
          text-[13px] text-(--color-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] mb-4"
      >
        <option value="">Select a reason</option>
        {REPORT_REASONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <label htmlFor={`${id}-details`} className="block text-[12px] font-semibold text-(--color-text) mb-2">
        Details <span className="font-normal text-(--color-text-muted)">(optional)</span>
      </label>
      <textarea
        id={`${id}-details`}
        value={details}
        maxLength={1000}
        onChange={event => setDetails(event.target.value)}
        className="w-full min-h-[90px] px-3 py-2.5 rounded-[10px] border border-(--color-border) bg-(--color-surface)
          text-[13px] text-(--color-text) resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
        placeholder="Add context that will help the review"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
        <span className="text-[11px] text-(--color-text-muted)">{details.length}/1000</span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending} aria-busy={mutation.isPending}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!reason || mutation.isPending} aria-busy={mutation.isPending}>
            {'Submit report'}
          </Button>
        </div>
      </div>
      {mutation.isError && (
        <p role="alert" className="text-[12px] text-[var(--color-danger)] mt-3">
          We couldn't submit the report. Please try again.
        </p>
      )}
    </section>
  )
}
