import { useState } from 'react'
import { authors } from '@/data'
import { colors, radius, fontSizes, fonts, transitions } from '@/styles/tokens'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'
import AuthorMeta from '@/components/ui/AuthorMeta'

const QUESTIONS = [
  {
    id: 1,
    text: "What's the best approach to start writing non-fiction?",
    author: authors[0],
    answers: 14,
    time: '2h',
  },
  {
    id: 2,
    text: "How do you overcome writer's block when on a deadline?",
    author: authors[1],
    answers: 9,
    time: '5h',
  },
  {
    id: 3,
    text: 'Is Medium still worth it for new writers in 2024?',
    author: authors[3],
    answers: 31,
    time: '1d',
  },
  {
    id: 4,
    text: 'How do you find your niche as a new writer on the internet?',
    author: authors[6],
    answers: 17,
    time: '2d',
  },
]

export default function QuestionsTab() {
  const [showAsk, setShowAsk] = useState(false)
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <Pill label="Trending Questions" active />
        <button
          onClick={() => setShowAsk((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: radius.full,
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.text,
            fontSize: fontSizes.base,
            fontWeight: 500,
            cursor: 'pointer',
            transition: transitions.default,
          }}
        >
          Ask your question
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </button>
      </div>

      {/* Ask form */}
      {showAsk && (
        <div
          style={{
            padding: 20,
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.border}`,
            marginBottom: 24,
          }}
        >
          <p style={{ fontWeight: 600, fontSize: fontSizes.md, marginBottom: 12 }}>
            Ask your question
          </p>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              background: colors.bgAlt,
              fontSize: fontSizes.base,
              color: colors.text,
              marginBottom: 10,
            }}
          />
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Add more context…"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              background: colors.bgAlt,
              fontSize: fontSizes.base,
              color: colors.text,
              resize: 'none',
              height: 80,
              marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" onClick={() => setShowAsk(false)}>
              Cancel
            </Button>
            <Button variant="primary">Post Question</Button>
          </div>
        </div>
      )}

      {/* Question list */}
      {QUESTIONS.map((q) => (
        <div
          key={q.id}
          style={{
            padding: '18px 0',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <AuthorMeta author={q.author} readTime={q.time} size="sm" />
          <p
            style={{
              fontFamily: fonts.display,
              fontSize: fontSizes.md,
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.4,
              margin: '8px 0',
            }}
          >
            {q.text}
          </p>
          <span style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>
            {q.answers} answers
          </span>
        </div>
      ))}
    </div>
  )
}
