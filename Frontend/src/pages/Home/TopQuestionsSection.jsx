/* TopQuestionsSection — teaser showing hot questions, drives curiosity */
import { useNavigate } from 'react-router-dom'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'

const HOT_QUESTIONS = [
  { id: 1, text: "What's the best approach to start writing non-fiction?", answers: 14, upvotes: 38 },
  { id: 2, text: "How do you overcome writer's block when on a deadline?",  answers: 9,  upvotes: 21 },
  { id: 3, text: 'Is Medium still worth it for new writers in 2024?',      answers: 31, upvotes: 72 },
  { id: 4, text: 'How do you find your niche as a new writer?',            answers: 17, upvotes: 44 },
]

export default function TopQuestionsSection() {
  const navigate = useNavigate()

  return (
    <div className="fade-in fade-in-3 mb-13">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionHeading>
            Hot Questions
          </SectionHeading>
          <p className="text-[13px] text-(--color-text-secondary) mt-1">
            What the writing community is curious about right now
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/explore/questions')}>
          See all →
        </Button>
      </div>

      <div className="grid gap-0">
        {HOT_QUESTIONS.map((q, i) => (
          <div key={q.id}
            className="flex items-start gap-4 py-4 border-b border-[var(--color-border-light)] cursor-pointer
              hover:bg-[var(--color-surface-hover)] -mx-2 px-2 rounded transition-all"
            onClick={() => navigate('/explore/questions')}>
            {/* Upvote count */}
            <div className="flex-shrink-0 w-10 text-center">
              <p className="font-bold text-[16px] text-[var(--color-text)]">{q.upvotes}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">votes</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-[var(--color-text)] leading-[1.45]">{q.text}</p>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">{q.answers} answers</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
