/* AIPanel — AI summary (streaming) + read aloud sticky buttons & panels */
import { useState, useEffect } from 'react'

const SummaryIcon = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'var(--color-text-muted)'} strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
const AudioIcon = ({ active }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'var(--color-text-muted)'} strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 010 7.07" />
  </svg>
)

export function AIStickyButtons({ onSummary, onAudio, showSummary, readAloud }) {
  return (
    <div className="sticky top-20 flex flex-col gap-[10px]">
      {[
        { fn: onSummary, active: showSummary, icon: <SummaryIcon active={showSummary} />, title: 'AI Summary' },
        { fn: onAudio,   active: readAloud,   icon: <AudioIcon active={readAloud} />,     title: 'Read Aloud' },
      ].map((btn, i) => (
        <button key={i} onClick={btn.fn} title={btn.title}
          className={`w-10 h-10 rounded-[10px] flex items-center justify-center cursor-pointer
            border transition-all duration-150
            ${btn.active
              ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
              : 'bg-[var(--color-bg-alt)] border-[var(--color-border)]'
            }`}>
          {btn.icon}
        </button>
      ))}
    </div>
  )
}

// ─── Streaming summary lines ───────────────────────────────────────────────────
const LINES = [
  '✦ The author reflects on returning to their childhood coastal town.',
  'Discovering that familiarity had blinded them to its true character.',
  "Drawing on Simone Weil's concept of attention as generosity,",
  'they argue that truly seeing a familiar place requires deliberately shifting perspective.',
  'The town turns out to be stranger and richer than memory suggested.',
]

export function SummaryPanel() {
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    setVisible(0)
    let i = 0
    const t = setInterval(() => { i++; setVisible(i); if (i >= LINES.length) clearInterval(t) }, 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="mt-6 p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px]">
      <p className="font-semibold text-[14px] mb-[14px] text-[var(--color-text)]">✦ AI Summary</p>
      <div className="flex flex-col gap-[6px]">
        {LINES.slice(0, visible).map((line, i) => (
          <p key={i} className="stream-line text-[13px] text-[var(--color-text-secondary)] leading-[1.7]"
            style={{ animationDelay: `${i * 0.05}s` }}>{line}</p>
        ))}
      </div>
    </div>
  )
}

export function ReadAloudPanel() {
  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(28)

  return (
    <div className="mt-6 px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)]
      rounded-[20px] flex items-center gap-4">
      <button onClick={() => setPlaying(v => !v)}
        className="w-10 h-10 rounded-full bg-[var(--color-accent)] border-none flex items-center justify-center
          cursor-pointer flex-shrink-0">
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        )}
      </button>
      <div className="flex-1">
        <p className="text-[12px] text-[var(--color-text-muted)] mb-[6px]">On this page</p>
        <div className="h-1 bg-[var(--color-bg-alt)] rounded-full cursor-pointer"
          onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.round(((e.clientX - r.left) / r.width) * 100)) }}>
          <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="text-[12px] text-[var(--color-text-muted)] flex-shrink-0">3:24 / 12:10</span>
    </div>
  )
}
