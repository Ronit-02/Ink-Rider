/* CompetitionsTab — competition list with ongoing + past, click → detail page */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { articles } from '@/data'
import Button from '@/components/ui/Button'

// ─── Competition data ──────────────────────────────────────────────────────────
export const COMPETITIONS = [
  { id: 1, title: 'The Long-Form Essay Challenge', status: 'open', closes: 'Jan 15, 2025', entries: 142, prizePool: '$800', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80', description: 'Write a 2,000–5,000 word essay on any topic. Top 3 entries win a feature slot on the homepage and a cash prize. Judges evaluate originality, structure, and depth of insight.', prizes: [{ rank: '🥇 1st', amount: '$500 + Feature' }, { rank: '🥈 2nd', amount: '$200 + Feature' }, { rank: '🥉 3rd', amount: '$100' }], resultsDate: 'Jan 20, 2025' },
  { id: 2, title: 'Flash Fiction Friday', status: 'open', closes: 'Jan 19, 2025', entries: 28, prizePool: '$200', image: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800&q=80', description: 'Write a complete story in under 500 words. Any genre. Judged on emotional impact and economy of language.', prizes: [{ rank: '🥇 1st', amount: '$120' }, { rank: '🥈 2nd', amount: '$80' }], resultsDate: 'Jan 25, 2025' },
  { id: 3, title: 'Science Sunday Vol. 2', status: 'closed', closes: 'Dec 12, 2024', entries: 54, prizePool: '$400', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', description: 'Explain a complex science topic for a general audience. Winner of Vol. 1 was "The Hidden Life of Fungi."', prizes: [{ rank: '🥇 1st', amount: '$250' }, { rank: '🥈 2nd', amount: '$150' }], resultsDate: 'Dec 18, 2024', winner: articles[11] },
  { id: 4, title: 'Travel Writing Open', status: 'closed', closes: 'Nov 30, 2024', entries: 89, prizePool: '$600', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80', description: 'Best travel piece under 3,000 words. Must be about a place you actually visited.', prizes: [{ rank: '🥇 1st', amount: '$400' }, { rank: '🥈 2nd', amount: '$200' }], resultsDate: 'Dec 5, 2024', winner: articles[5] },
]

// ─── Competition card (list view) ─────────────────────────────────────────────
function CompCard({ comp }) {
  const navigate = useNavigate()
  const isOpen   = comp.status === 'open'

  return (
    <div
      className="flex gap-4 py-5 border-b border-[var(--color-border)] cursor-pointer group"
      onClick={() => navigate(`/explore/competitions/${comp.id}`)}>
      <img src={comp.image} alt={comp.title}
        className="w-[120px] h-[80px] object-cover rounded-[10px] flex-shrink-0 block" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`px-[10px] py-[3px] rounded-full text-[11px] font-semibold
            ${isOpen ? 'bg-[#FFF3CD] text-[#856404]' : 'bg-[var(--color-bg-alt)] text-[var(--color-text-muted)]'}`}>
            {isOpen ? '🏆 Open' : '✓ Closed'} · {comp.closes}
          </span>
          <span className="text-[12px] text-[var(--color-text-muted)]">{comp.entries} entries · {comp.prizePool} prize pool</span>
        </div>
        <h3 className="font-bold text-[16px] text-[var(--color-text)] leading-[1.35] mb-1"
          style={{ fontFamily: 'var(--font-display)' }}>{comp.title}</h3>
        <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2">{comp.description}</p>
      </div>
      <span className="text-[13px] text-[var(--color-accent)] font-medium self-center flex-shrink-0
        opacity-0 group-hover:opacity-100 transition-opacity">
        View →
      </span>
    </div>
  )
}

// ─── Competitions Tab ──────────────────────────────────────────────────────────
export default function CompetitionsTab() {
  const ongoing = COMPETITIONS.filter(c => c.status === 'open')
  const past    = COMPETITIONS.filter(c => c.status === 'closed')

  return (
    <div>
      {/* ── Ongoing ── */}
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.08em] mb-3">
        Ongoing Competitions
      </p>
      {ongoing.map(c => <CompCard key={c.id} comp={c} />)}

      {/* ── Past ── */}
      <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.08em] mt-8 mb-3">
        Past Competitions
      </p>
      {past.map(c => <CompCard key={c.id} comp={c} />)}
    </div>
  )
}
