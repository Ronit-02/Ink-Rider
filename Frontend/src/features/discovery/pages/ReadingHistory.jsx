import { Link } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import useReadingHistory from '../hooks/useReadingHistory'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'

function HistoryRow({ item }) {
  return <Link to={`/post/${item.id}`} className="block py-5 border-b border-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><AuthorMeta author={item.author} date={item.lastReadAt} readTime={item.readTime} /><h2 className="mt-3 text-[17px] font-bold text-[var(--color-text)]">{item.title}</h2><div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 max-w-64 rounded-full bg-[var(--color-bg-alt)] overflow-hidden"><div className="h-full bg-[var(--color-accent)]" style={{ width: `${item.progress}%` }} /></div><span className="text-[11px] text-[var(--color-text-muted)]">{item.completed ? 'Completed' : item.progress ? `${item.progress}% read` : 'Opened'}</span></div></Link>
}

export default function ReadingHistoryPage() {
  const query = useReadingHistory()
  if (query.isPending) return <main className="max-w-[850px] mx-auto px-5 md:px-8 pt-10 pb-24"><div role="status" aria-label="Loading reading history"><ListSkeleton count={5} role={undefined} /></div></main>
  if (query.isError) return <main className="max-w-[850px] mx-auto px-5 md:px-8 pt-10 pb-24"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Reading history could not be loaded.</p><Button className="mt-4" onClick={() => query.refetch()}>Try again</Button></main>
  return <main className="max-w-[850px] mx-auto px-5 md:px-8 pt-10 pb-24"><header className="mb-10"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Your library</p><h1 className="mt-3 text-[clamp(32px,5vw,50px)] font-bold tracking-[-0.05em] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Reading history</h1></header>{query.data.continueReading.length > 0 && <section className="mb-12"><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Continue reading</h2>{query.data.continueReading.map(item => <HistoryRow key={item.id} item={item} />)}</section>}<section><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Recent history</h2>{query.data.history.map(item => <HistoryRow key={item.id} item={item} />)}{query.data.history.length === 0 && <p className="py-12 text-[13px] text-[var(--color-text-muted)]">Articles and shorts you open will appear here.</p>}</section></main>
}
