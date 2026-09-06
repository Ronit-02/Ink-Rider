import { Link } from 'react-router-dom'
import PageFrame from '@/shared/components/layout/PageFrame'
import PageHeader from '@/shared/components/ui/PageHeader'
import Button from '@/shared/components/ui/Button'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import { useQuestionClaim, useQuestionOpportunities } from '../hooks/useQuestions'

function SummaryCard({ label, value }) {
  return <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><p className="text-[11px] text-[var(--color-text-muted)]">{label}</p><p className="mt-2 text-[24px] font-semibold tabular-nums text-[var(--color-text)]">{value}</p></div>
}

function OpportunityCard({ opportunity }) {
  const { claim, decline } = useQuestionClaim()
  return <article className="border-b border-[var(--color-border)] py-6">
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-info)]">{opportunity.fitScore}% fit</p>
        <h2 className="mt-2 text-[19px] leading-[1.35] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}><Link to={`/explore/questions/${opportunity.id}`} className="rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">{opportunity.text}</Link></h2>
        {opportunity.context && <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">{opportunity.context}</p>}
        <div className="mt-3 flex flex-wrap gap-2">{opportunity.tags.map(tag => <span key={tag} className="rounded-full bg-[var(--color-bg-alt)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)]">#{tag}</span>)}</div>
        <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">{opportunity.reason} · {opportunity.upvotesCount} upvotes · {opportunity.followersCount} following</p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2"><Button variant={opportunity.isClaimedByYou ? 'secondary' : 'primary'} disabled={claim.isPending || decline.isPending} onClick={() => claim.mutate({ questionId: opportunity.id, isClaimed: !opportunity.isClaimedByYou })}>{opportunity.isClaimedByYou ? 'Release' : 'Claim'}</Button><Link to={`/write?question=${opportunity.id}`} className={`inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-3 text-[11px] font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:min-h-0 ${!opportunity.isClaimedByYou ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={!opportunity.isClaimedByYou}>Write response</Link><button type="button" disabled={claim.isPending || decline.isPending} onClick={() => decline.mutate({ questionId: opportunity.id })} className="min-h-10 rounded-full px-3 text-[11px] text-[var(--color-text-muted)] underline-offset-2 hover:underline sm:min-h-0">Not for me</button></div>
    </div>
  </article>
}

export default function OpportunitiesPage() {
  const query = useQuestionOpportunities()
  const opportunities = query.data?.data || []
  const summary = query.data?.meta?.summary
  return <PageFrame>
    <PageHeader eyebrow="Writer opportunities" title="Answer what readers are asking for" description="Questions are ranked by topic fit, reader demand, and freshness so you can choose a useful next story." />
    {query.isPending && <ListSkeleton count={4} label="Loading writer opportunities" />}
    {query.isError && <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">Writer opportunities could not be loaded.</p><Button variant="secondary" className="mt-4" onClick={() => query.refetch()}>Try again</Button></div>}
    {!query.isPending && !query.isError && <div>
      <section aria-label="Demand summary" className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Open questions" value={summary?.openQuestions || 0} /><SummaryCard label="Reader upvotes" value={summary?.totalUpvotes || 0} /><SummaryCard label="Your topic signals" value={query.data?.meta?.writerTopics?.length || 0} /></section>
      {summary?.topTopics?.length > 0 && <section aria-labelledby="demand-topics" className="mt-8"><h2 id="demand-topics" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Demand by topic</h2><div className="mt-3 flex flex-wrap gap-2">{summary.topTopics.map(item => <span key={item.topic} className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[11px] text-[var(--color-text-secondary)]">#{item.topic} · {item.upvotes}</span>)}</div></section>}
      <section aria-labelledby="opportunity-list" className="mt-10"><h2 id="opportunity-list" className="text-[20px] font-bold text-[var(--color-text)]">Recommended questions</h2>{opportunities.length ? opportunities.map(item => <OpportunityCard key={item.id} opportunity={item} />) : <p className="py-12 text-[13px] text-[var(--color-text-muted)]">There are no open questions to recommend yet.</p>}</section>
    </div>}
  </PageFrame>
}
