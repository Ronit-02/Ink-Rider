import { articles } from '@/shared/data'
import ArticleCard from '@/features/posts/components/ArticleCard'

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-4">
      {children}
    </p>
  )
}

export default function SubscriberContent() {
  return (
    <div className="flex flex-col gap-10">
      {/* Upcoming webinar */}
      <div>
        <SectionLabel>Upcoming Webinar</SectionLabel>
        <div className="bg-[var(--color-surface)] rounded-[20px] border border-[var(--color-border)]
          overflow-hidden flex">
          <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80"
            alt="webinar" loading="lazy"
            className="w-[260px] h-[160px] object-cover flex-shrink-0 block" />
          <div className="p-6">
            <p className="font-bold text-[18px] leading-[1.3] mb-2 text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}>Writing in the Age of AI</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6] mb-3">
              Join Adeline for a live session on how authors can use AI as a creative tool without losing their voice.
            </p>
            <p className="text-[12px] text-[var(--color-text-muted)]">Jan 20, 2025 · 3:00 PM IST</p>
          </div>
        </div>
      </div>

      {/* Early access */}
      <div>
        <SectionLabel>Early Access</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          {articles.slice(2, 4).map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      </div>

      {/* Behind the scenes */}
      <div>
        <SectionLabel>Behind the Scenes</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          {articles.slice(4, 6).map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      </div>
    </div>
  )
}
