/* QuestionsTab — upvote questions, expandable answers + related articles, ask popup */
import { useState } from 'react'
import { authors, articles } from '@/shared/data'
import Pill from '@/shared/components/ui/Pill'
import Button from '@/shared/components/ui/Button'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import HorizontalCard from '@/features/post/components/HorizontalCard'

// ─── Seed data ─────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 1, text: "What's the best approach to start writing non-fiction?", author: authors[0], answers: 14, upvotes: 38, time: '2h', tags: ['non-fiction','craft'],   relatedArticles: [articles[0], articles[1]] },
  { id: 2, text: "How do you overcome writer's block when on a deadline?",  author: authors[1], answers: 9,  upvotes: 21, time: '5h', tags: ['productivity','writing'], relatedArticles: [articles[2]] },
  { id: 3, text: 'Is Medium still worth it for new writers in 2024?',      author: authors[3], answers: 31, upvotes: 72, time: '1d', tags: ['platform','monetization'], relatedArticles: [articles[4], articles[6]] },
  { id: 4, text: 'How do you find your niche as a new writer on the internet?', author: authors[6], answers: 17, upvotes: 44, time: '2d', tags: ['growth','niche'], relatedArticles: [articles[5]] },
]

const MOCK_ANSWERS = [
  { id: 1, author: authors[2], text: "Start with what you know deeply. Non-fiction shines when personal experience meets genuine curiosity.", time: '1h', upvotes: 14 },
  { id: 2, author: authors[5], text: "Outline obsessively before you draft. Structure is everything in non-fiction.", time: '3h', upvotes: 9 },
]

// ─── Upvote button ─────────────────────────────────────────────────────────────
function UpvoteBtn({ count, voted, onVote }) {
  return (
    <button onClick={onVote}
      className={`flex flex-col items-center gap-0.5 px-[10px] py-[6px] rounded-[10px] border
        transition-all duration-150 min-w-[44px] cursor-pointer
        ${voted
          ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
          : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]'
        }`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span className="text-[12px] font-semibold">{count}</span>
    </button>
  )
}

// ─── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({ q }) {
  const [expanded,   setExpanded]   = useState(false)
  const [voted,      setVoted]      = useState(false)
  const [upvotes,    setUpvotes]    = useState(q.upvotes)
  const [showWrite,  setShowWrite]  = useState(false)
  const [answerText, setAnswerText] = useState('')

  return (
    <div className="py-5 border-b border-[var(--color-border)]">
      <div className="flex gap-[14px]">
        <UpvoteBtn count={upvotes} voted={voted}
          onVote={() => { setVoted(v => !v); setUpvotes(n => voted ? n - 1 : n + 1) }} />

        <div className="flex-1">
          <div className="mb-2"><AuthorMeta author={q.author} readTime={q.time} size="sm" /></div>

          <p className="font-bold text-[16px] text-[var(--color-text)] leading-[1.4] mb-[10px] cursor-pointer"
            style={{ fontFamily: 'var(--font-display)' }}
            onClick={() => setExpanded(v => !v)}>
            {q.text}
          </p>

          {/* Tags */}
          <div className="flex gap-[6px] mb-3 flex-wrap">
            {q.tags?.map(t => (
              <span key={t} className="px-2 py-[2px] rounded-full text-[12px] bg-[var(--color-bg-alt)]
                text-[var(--color-text-secondary)] font-medium">#{t}</span>
            ))}
          </div>

          <div className="flex gap-[14px] items-center">
            <span className="text-[12px] text-[var(--color-text-muted)]">{q.answers} answers</span>
            <button onClick={() => setExpanded(v => !v)}
              className="text-[12px] text-[var(--color-accent)] border-none bg-transparent cursor-pointer font-medium">
              {expanded ? 'Hide' : 'See answers & articles'}
            </button>
            <button onClick={() => setShowWrite(v => !v)}
              className="text-[12px] text-[var(--color-text-secondary)] border-none bg-transparent cursor-pointer">
              Write answer
            </button>
          </div>

          {/* Expanded answers */}
          {expanded && (
            <div className="mt-5">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-[14px]">Top Answers</p>
              {MOCK_ANSWERS.map(ans => (
                <div key={ans.id} className="py-[14px] border-b border-[var(--color-border-light)]">
                  <AuthorMeta author={ans.author} readTime={ans.time} size="sm" />
                  <p className="text-[13px] text-[var(--color-text)] leading-[1.65] my-2">{ans.text}</p>
                  <span className="text-[12px] text-[var(--color-text-muted)]">▲ {ans.upvotes} helpful</span>
                </div>
              ))}
              {q.relatedArticles?.length > 0 && (
                <div className="mt-5">
                  <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-[14px]">Related Articles</p>
                  {q.relatedArticles.map(a => <HorizontalCard key={a.id} article={a} />)}
                </div>
              )}
            </div>
          )}

          {/* Write answer */}
          {showWrite && (
            <div className="mt-4">
              <textarea value={answerText} onChange={e => setAnswerText(e.target.value)}
                placeholder="Share your knowledge…"
                className="w-full min-h-[100px] px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
                  bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] resize-none font-[inherit] outline-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="secondary" onClick={() => { setShowWrite(false); setAnswerText('') }}>Cancel</Button>
                <Button variant="primary">Post Answer</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Ask Question popup ────────────────────────────────────────────────────────
function AskModal({ onClose }) {
  const [question, setQuestion] = useState('')
  const [context,  setContext]  = useState('')

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--color-surface)] rounded-[20px] border border-[var(--color-border)]
        p-6 w-full max-w-[500px] shadow-[0_16px_48px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[18px] text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}>Ask the community</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-transparent
              text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer text-[18px]">×</button>
        </div>
        <input value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="What's your question?"
          className="w-full px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
            bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] mb-3 outline-none"
        />
        <textarea value={context} onChange={e => setContext(e.target.value)}
          placeholder="Add more context…"
          className="w-full px-[14px] py-[10px] border border-[var(--color-border)] rounded-[10px]
            bg-[var(--color-bg-alt)] text-[13px] text-[var(--color-text)] resize-none h-20 mb-4
            font-[inherit] outline-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Post Question</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Questions Tab ─────────────────────────────────────────────────────────────
export default function QuestionsTab() {
  const [showAsk, setShowAsk] = useState(false)
  const [sortBy,  setSortBy]  = useState('hot')

  return (
    <div>
      {/* ── Callout banner ── */}
      <div className="p-5 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-[20px] mb-7">
        <h2 className="font-bold text-[18px] mb-2 text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}>Writers' Forum</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6] mb-4">
          Discover what the writing community is curious about. Pick a hot question and make it your next article — or share your expertise as an answer.
        </p>
        <Button variant="primary" onClick={() => setShowAsk(true)}>Ask a Question</Button>
      </div>

      {/* ── Sort pills ── */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'hot', label: '🔥 Hot' }, { id: 'top', label: '▲ Top Voted' }, { id: 'newest', label: '✦ Newest' }].map(p => (
          <Pill key={p.id} label={p.label} active={sortBy === p.id} onClick={() => setSortBy(p.id)} />
        ))}
      </div>

      {/* ── Question list ── */}
      {QUESTIONS.map(q => <QuestionCard key={q.id} q={q} />)}

      {/* ── Ask popup ── */}
      {showAsk && <AskModal onClose={() => setShowAsk(false)} />}
    </div>
  )
}
