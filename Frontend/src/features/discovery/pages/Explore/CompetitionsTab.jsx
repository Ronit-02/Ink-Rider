import { Link, useSearchParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import { useCompetition, useCompetitions } from '@/features/competition/hooks/useCompetitions'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import PageHeader from '@/shared/components/ui/PageHeader'
import ImageBox from '@/shared/components/ui/ImageBox'
import CompetitionImage from '@/features/competition/components/CompetitionImage'
import Pill from '@/shared/components/ui/Pill'
import FilterBar from '@/shared/components/ui/FilterBar'

const formatDate = value => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'To be announced'

function CompetitionCard({ competition }) {
  return <Link to={`/explore/competitions/${competition.id}`} className="flex gap-4 py-5 border-b border-[var(--color-border)] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">
    <div className="w-[120px] shrink-0"><CompetitionImage src={competition.coverImage} title={competition.title} status={competition.status} height={80} /></div>
    <div className="min-w-0 flex-1"><div className="flex gap-2 items-center mb-2"><span className="px-2.5 py-1 rounded-full bg-[var(--color-bg-alt)] text-[10px] font-semibold uppercase text-[var(--color-text-secondary)]">{competition.status}</span><span className="text-[11px] text-[var(--color-text-muted)]">Closes {formatDate(competition.closeDate)} · {competition.entriesCount} entries</span></div><h2 className="text-[17px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{competition.title}</h2><p className="mt-1 text-[12px] text-[var(--color-text-secondary)] line-clamp-2">{competition.description}</p></div>
  </Link>
}

export default function CompetitionsTab() {
  const query = useCompetitions()
  if (query.isPending) return <ListSkeleton count={4} label="Loading competitions" />
  if (query.isError) return <div role="alert" className="py-12 text-center"><p className="text-[13px] text-[var(--color-danger)]">Competitions could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()}>Try again</Button></div>
  const active = query.data.filter(item => ['open', 'judging'].includes(item.status))
  const past = query.data.filter(item => !active.includes(item))
  return <CompetitionContent active={active} past={past} />
}

function CompetitionContent({ active, past }) {
  const [params, setParams] = useSearchParams()
  const tab = ['active', 'inactive'].includes(params.get('competitionTab')) ? params.get('competitionTab') : 'active'
  const competitionType = ['all', 'theme', 'timed', 'collaborative', 'reader_choice'].includes(params.get('competitionType')) ? params.get('competitionType') : 'all'
  const filteredActive = competitionType === 'all' ? active : active.filter(item => item.competitionType === competitionType)
  const filteredPast = competitionType === 'all' ? past : past.filter(item => item.competitionType === competitionType)
  const winnerCompetition = filteredPast.find(item => item.status === 'closed')
  const winnerQuery = useCompetition(winnerCompetition?.id)
  const winner = winnerQuery.data?.entries?.find(entry => entry.isWinner)
  const visibleCompetitions = tab === 'active' ? filteredActive : filteredPast
  const updateFilter = (key, value, defaultValue) => {
    setParams(current => {
      const next = new URLSearchParams(current)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
      return next
    })
  }
  return <div>
    <PageHeader eyebrow="Explore" title="Competitions" description="Recurring prompts for writers and readers to discover something new." />
    {winner?.post && <section className="mb-12"><Link to={`/post/${winner.post._id}`} className="group grid w-full gap-5 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4 text-left sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"><ImageBox src={winner.post.coverImage} alt="" height={150} radius="12px" /><span className="flex min-w-0 flex-col justify-center"><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Recent winner</span><span className="mt-2 text-[22px] font-bold leading-[1.2] text-[var(--color-text)] group-hover:text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>{winner.post.title}</span><span className="mt-3 text-[12px] text-[var(--color-text-secondary)]">{winner.author?.username || 'Ink Rider writer'} · {winner.likesCount} reader votes</span></span></Link></section>}
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex gap-2"><Pill label={`Active (${filteredActive.length})`} active={tab === 'active'} onClick={() => updateFilter('competitionTab', 'active', 'active')} /><Pill label={`Inactive (${filteredPast.length})`} active={tab === 'inactive'} onClick={() => updateFilter('competitionTab', 'inactive', 'active')} /></div>
      <FilterBar label="Competition type" value={competitionType} onChange={value => updateFilter('competitionType', value, 'all')} options={[{ id: 'all', label: 'All' }, { id: 'theme', label: 'Theme' }, { id: 'timed', label: 'Timed' }, { id: 'collaborative', label: 'Collaborative' }, { id: 'reader_choice', label: 'Reader choice' }]} />
    </div>
    {visibleCompetitions.length ? visibleCompetitions.map(item => <CompetitionCard key={item.id} competition={item} />) : <p className="py-8 text-[13px] text-[var(--color-text-muted)]">No {tab === 'active' ? 'active' : 'inactive'} competitions match this filter.</p>}
  </div>
}
