import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Avatar from '@/shared/components/ui/Avatar'
import ImageBox from '@/shared/components/ui/ImageBox'
import ActionMenu, { ActionMenuTrigger, ActionMenuItem, HideActionIcon } from '@/shared/components/ui/ActionMenu'
import ShareMenu from '@/shared/components/ui/ShareMenu'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import Button from '@/shared/components/ui/Button'
import LinkIcon from '@/shared/icons/LinkIcon'
import { PenIcon } from '@/shared/icons'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import useToast from '@/shared/hooks/useToast'
import { useDeleteShortSeries } from '../hooks/useShortSeries'

const formatSeriesDate = value => value
  ? new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  : null

export default function SeriesCard({ series }) {
  const navigate = useNavigate()
  const { notify } = useToast()
  const deletion = useDeleteShortSeries(series.id)
  const triggerRef = useRef(null)
  const deleteCloseRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const menuId = `series-menu-${series.id}`
  const deleteDialogId = `delete-series-dialog-${series.id}`
  const closeDelete = () => { if (!deletion.isPending) setDeleteOpen(false) }
  const deleteDialogRef = useDialogFocus(closeDelete, deleteCloseRef, deleteOpen)
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setMenuOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  const isShortSeries = series.type === 'short'
  const formatLabel = isShortSeries ? 'Short series' : 'Story series'
  const createdLabel = formatSeriesDate(series.createdAt)
  const writerName = series.author?.username || 'Ink Rider writer'

  if (hidden) return null

  return (
    <article className="group relative grid grid-cols-1 overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] transition-colors hover:bg-[var(--color-surface-hover)] sm:grid-cols-[minmax(140px,0.8fr)_minmax(0,1.2fr)]">
      <div className="absolute right-3 top-3 z-10">
        <ActionMenuTrigger ref={triggerRef} type="button" aria-label={`More options for ${series.title}`} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? menuId : undefined} onClick={() => setMenuOpen(value => !value)} />
        {menuOpen && <ActionMenu anchorRef={triggerRef} onClose={closeMenu} id={menuId} label={`Options for ${series.title}`}>
          {series.isOwner && <ActionMenuItem icon={<PenIcon />} onClick={() => navigate(`/series/${series.id}`, { state: { openEditSeries: true } })}>Edit series</ActionMenuItem>}
          <ActionMenuItem icon={<LinkIcon />} onClick={() => { closeMenu(); setShareOpen(true) }}>Share link</ActionMenuItem>
          {series.isOwner && <ActionMenuItem tone="danger" icon={<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></svg>} onClick={() => { closeMenu(); setDeleteOpen(true) }}>Delete series</ActionMenuItem>}
          <ActionMenuItem icon={<HideActionIcon />} onClick={() => { setHidden(true); setMenuOpen(false); notify('Series hidden from this list.', { tone: 'info' }) }}>Not interested</ActionMenuItem>
        </ActionMenu>}
      </div>
      <div className="aspect-[2/1] min-h-0 overflow-hidden border-b border-[var(--color-border)] [&>div]:h-full [&>div]:transition-transform [&>div]:duration-200 group-hover:[&>div]:scale-[1.02] sm:aspect-auto sm:border-b-0 sm:border-r">
        <ImageBox src={series.coverImage} alt="" height="100%" radius="0" placeholderLabel={formatLabel} />
      </div>
      <div className="flex min-w-0 flex-col p-3 sm:p-4">
        <div className="flex min-w-0 items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.08em]">
          <span className="truncate text-[var(--color-accent)]">{formatLabel}{createdLabel ? ` · ${createdLabel}` : ''}</span>
          <span className="shrink-0 pr-10 text-[var(--color-text-muted)]">{series.entriesCount} parts</span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-[17px] font-bold leading-[1.25] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}><Link to={`/series/${series.id}`} aria-label={`View series ${series.title}`} className="rounded-[4px] after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{series.title}</Link></h2>
        {series.description && <p className="mt-2 line-clamp-1 text-[12px] leading-5 text-[var(--color-text-secondary)] sm:line-clamp-2">{series.description}</p>}
        <div className="mt-auto flex min-w-0 items-center gap-2 pt-3 text-[11px] text-[var(--color-text-muted)]">
          <Avatar src={series.author?.picture} name={writerName} size={28} />
          <span className="min-w-0 flex-1 truncate">by {writerName}</span>
          <span className="shrink-0 font-semibold text-[var(--color-text-secondary)] transition-transform duration-150 group-hover:translate-x-0.5">View →</span>
        </div>
      </div>
      {shareOpen && <ShareMenu anchorRef={triggerRef} id={`series-share-${series.id}`} label="Share series" contentName="Series" url={`${window.location.origin}/series/${series.id}`} onClose={({ restoreFocus = false } = {}) => { setShareOpen(false); if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus()) }} />}
      {deleteOpen && <ModalLayer onDismiss={closeDelete} returnFocusRef={triggerRef} aria-labelledby={`${deleteDialogId}-title`} className="flex items-center justify-center p-4 backdrop:bg-black/40">
        <section ref={deleteDialogRef} tabIndex={-1} className="w-full max-w-[420px] overflow-y-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-menu)]">
          <ModalHeader title="Delete series?" titleId={`${deleteDialogId}-title`} onClose={closeDelete} closeLabel="Cancel delete" closeRef={deleteCloseRef} className="-mx-6 -mt-6" />
          <p className="mt-3 text-[13px] leading-5 text-[var(--color-text-secondary)]">This permanently removes “{series.title}”. Posts in the series are not deleted.</p>
          {deletion.isError && <p role="alert" className="mt-3 text-[12px] text-[var(--color-danger)]">Could not delete series. Try again.</p>}
          <div className="mt-6 flex justify-end"><Button onClick={() => deletion.mutate(undefined, { onSuccess: () => { setDeleteOpen(false); setHidden(true) } })} disabled={deletion.isPending} aria-busy={deletion.isPending} className="!bg-[var(--color-danger)] !border-[var(--color-danger)]">Delete series</Button></div>
        </section>
      </ModalLayer>}
    </article>
  )
}
