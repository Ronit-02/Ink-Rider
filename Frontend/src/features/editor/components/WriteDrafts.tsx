import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import PageFrame from '@/shared/components/layout/PageFrame'
import Button from '@/shared/components/ui/Button'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import useLoginPrompt from '@/features/auth/hooks/useLoginPrompt'
import { createDraft, fetchDrafts } from '../api/drafts'
import DeleteDraftButton from './DeleteDraftButton'

type Props = { loggedIn: boolean }
type Format = 'article' | 'short'
type Draft = { _id: string; title: string; format: Format; updatedAt: string }

export default function WriteDrafts({ loggedIn }: Props) {
  const [choosing, setChoosing] = useState(false)
  const signIn = useLoginPrompt()
  const drafts = useQuery<Draft[]>({ queryKey: ['me', 'drafts'], queryFn: fetchDrafts, enabled: loggedIn, retry: false, refetchOnMount: 'always' })
  return <PageFrame>
    <header className="mb-8 flex items-start justify-between gap-4">
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">Publishing</p><h1 className="mt-2 text-[clamp(29px,4vw,42px)] font-bold tracking-[-0.05em]" style={{ fontFamily: 'var(--font-display)' }}>Write</h1><p className="mt-3 text-[13px] leading-6 text-[var(--color-text-secondary)]">Continue a draft or start something new.</p></div>
      <Button className="!min-h-11 shrink-0" onClick={() => setChoosing(true)}>Write new</Button>
    </header>
    <section aria-label="Drafts">
      <h2 className="mb-4 text-[15px] font-semibold">Drafts</h2>
      {!loggedIn ? <div><p className="text-[13px] text-[var(--color-text-secondary)]">Sign in to access saved drafts, or choose Write new to start writing.</p><Button variant="secondary" className="mt-4 !min-h-11" onClick={signIn}>Sign In</Button></div>
        : drafts.isPending ? <p role="status">Loading drafts…</p>
        : drafts.isError ? <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">Drafts could not be loaded.</p><Button variant="secondary" className="mt-4" disabled={drafts.isFetching} aria-busy={drafts.isFetching} onClick={() => drafts.refetch()}>Try again</Button></div>
        : drafts.data?.length ? <div className="border-t border-[var(--color-border)]">{drafts.data.map(draft => <div key={draft._id} className="flex flex-wrap items-center gap-x-4 border-b border-[var(--color-border)] py-4"><Link to={`/write?draft=${draft._id}`} className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-4">
          <div className="min-w-0"><p className="break-words text-[14px] font-semibold">{draft.title || 'Untitled draft'}</p><p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{draft.format === 'short' ? 'Short' : 'Post'} · Saved {new Date(draft.updatedAt).toLocaleString()}</p></div><span className="shrink-0 text-[13px]" aria-hidden="true">→</span>
        </Link><DeleteDraftButton draft={draft} /></div>)}</div> : <p className="py-8 text-[13px] text-[var(--color-text-secondary)]">No drafts yet. Choose Write new to start your first one.</p>}
    </section>
    {choosing && <FormatChooser loggedIn={loggedIn} onClose={() => setChoosing(false)} />}
  </PageFrame>
}

function FormatChooser({ loggedIn, onClose }: Props & { onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const firstChoice = useRef<HTMLButtonElement>(null)
  const pendingRef = useRef(false)
  const create = useMutation({ mutationFn: (format: Format) => createDraft({ title: '', format, blocks: [{ id: uuid(), type: 'text', content: '' }], tags: [] }) })
  const dismiss = () => { if (!pendingRef.current) onClose() }
  const dialogRef = useDialogFocus(dismiss, firstChoice)
  const choose = async (format: Format) => {
    if (pendingRef.current) return
    if (!loggedIn) { navigate(`/write?new=${format}${location.hash}`); return }
    pendingRef.current = true
    try {
      const draft = await create.mutateAsync(format)
      navigate(`/write?draft=${draft.id}${location.hash}`)
    } catch { /* The modal retains the choices and exposes retry below. */ }
    finally { pendingRef.current = false }
  }
  return <ModalLayer onDismiss={dismiss} aria-labelledby="write-format-title" className="flex items-center justify-center p-4">
    <section ref={dialogRef} tabIndex={-1} className="w-full max-w-[420px] overflow-y-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-menu)]">
      <ModalHeader title="What do you want to write?" titleId="write-format-title" closeLabel="Close writing choices" onClose={dismiss} />
      <div className="flex flex-col gap-3 p-4 sm:p-6">
        <button ref={firstChoice} type="button" disabled={create.isPending} aria-busy={create.isPending && create.variables === 'article'} onClick={() => choose('article')} className="min-h-11 rounded-[10px] border border-[var(--color-border)] p-4 text-left hover:bg-[var(--color-bg-alt)]"><span className="block text-[14px] font-semibold">Post</span><span className="mt-1 block text-[13px] text-[var(--color-text-secondary)]">A full story with a cover image.</span></button>
        <button type="button" disabled={create.isPending} aria-busy={create.isPending && create.variables === 'short'} onClick={() => choose('short')} className="min-h-11 rounded-[10px] border border-[var(--color-border)] p-4 text-left hover:bg-[var(--color-bg-alt)]"><span className="block text-[14px] font-semibold">Short</span><span className="mt-1 block text-[13px] text-[var(--color-text-secondary)]">A focused idea within 500 words.</span></button>
        {create.isError && <p role="alert" className="text-[13px] text-[var(--color-danger)]">Your draft could not be created. Choose a type to try again.</p>}
      </div>
    </section>
  </ModalLayer>
}
