import ModalHeader from '@/shared/components/ui/ModalHeader'
import ShareMenu from '@/shared/components/ui/ShareMenu'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import ViewportPopover from '@/shared/components/ui/ViewportPopover'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ImageBox from '@/shared/components/ui/ImageBox'
import useAuth from '@/features/auth/hooks/useAuth'
import { useCollectionSave, useDeleteCollection } from '../hooks/useCollections'
import useToast from '@/shared/hooks/useToast'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import Button from '@/shared/components/ui/Button'

export default function CollectionCard({ collection }) {
  const { loggedIn, signIn } = useAuth()
  const { notify } = useToast()
  const save = useCollectionSave(collection.id)
  const remove = useDeleteCollection(collection.id)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const actionMenuRef = useRef(null)
  const deleteCloseRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const menuId = `collection-menu-${collection.id}`
  const deleteDialogId = `delete-collection-dialog-${collection.id}`
  const deleteDialogRef = useDialogFocus(() => setDeleteOpen(false), deleteCloseRef, deleteOpen)
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setMenuOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    actionMenuRef.current?.querySelector('[role="menuitem"]')?.focus()
    const close = event => {
      if (!menuRef.current?.contains(event.target) && !actionMenuRef.current?.contains(event.target)) closeMenu()
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const handleMenuKeyDown = event => {
    const items = [...actionMenuRef.current?.querySelectorAll('[role="menuitem"]') || []]
    const index = items.indexOf(document.activeElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu({ restoreFocus: true })
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const offset = event.key === 'ArrowDown' ? 1 : -1
      items[(index + offset + items.length) % items.length]?.focus()
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
    } else if (event.key === 'Tab' && ((event.shiftKey && index === 0) || (!event.shiftKey && index === items.length - 1))) {
      setMenuOpen(false)
    }
  }

  const toggleSave = event => {
    event.stopPropagation()
    if (!loggedIn) {
      signIn()
      return
    }
    save.mutate(!collection.isSaved, { onSuccess: () => closeMenu({ restoreFocus: true }) })
  }

  const share = event => { event.stopPropagation(); closeMenu(); setShareOpen(true) }

  const requestDelete = event => {
    event.stopPropagation()
    closeMenu()
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    remove.mutate(undefined, { onSuccess: () => { setDeleteOpen(false); setHidden(true) } })
  }

  if (hidden) return null

  return (
    <article className="group relative flex min-h-[216px] flex-col overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 pt-5">
      <div ref={menuRef} className="absolute right-4 top-5 z-10">
        <button ref={triggerRef} type="button" aria-label={`More options for ${collection.title}`} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? menuId : undefined} onClick={event => { event.stopPropagation(); setMenuOpen(value => !value) }} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"><span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[20px] leading-none transition-colors hover:bg-[var(--color-bg-alt)]"><span className="-mt-2">…</span></span></button>
        {menuOpen && <ViewportPopover ref={actionMenuRef} anchorRef={triggerRef} onAnchorHidden={() => closeMenu()} id={menuId} role="menu" tabIndex={-1} aria-label={`Options for ${collection.title}`} onKeyDown={handleMenuKeyDown} className="absolute right-0 top-10 w-52 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">
          <button type="button" role="menuitem" disabled={save.isPending} aria-busy={save.isPending} onClick={toggleSave} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{collection.isSaved ? 'Remove from saved' : 'Save collection'}</button>
          <button type="button" role="menuitem" onClick={share} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Share link</button>
          {collection.isOwner && <button type="button" role="menuitem" onClick={requestDelete} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-danger)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Delete collection</button>}
          <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); setHidden(true); setMenuOpen(false); notify('Collection hidden from this list.', { tone: 'info' }) }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Not interested</button>
        </ViewportPopover>}
      </div>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_34%] items-center gap-4">
        <div className="min-w-0">
          <h2 className="line-clamp-2 [overflow-wrap:anywhere] text-[18px] font-normal leading-[1.3] text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}><Link to={`/collections/${collection.id}`} className="rounded-[4px] after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{collection.title}</Link></h2>
          <p className="mt-2 line-clamp-3 [overflow-wrap:anywhere] text-[13px] leading-5 text-[var(--color-text-secondary)]">{collection.description || 'A curated reading collection.'}</p>
        </div>
        <div className="min-w-0 overflow-hidden rounded-[8px] [&>div]:transition-transform [&>div]:duration-200 group-hover:[&>div]:scale-[1.02]"><ImageBox src={collection.coverImage} alt="" height={120} radius="8px" placeholderLabel="Reading collection" /></div>
      </div>
      <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-[var(--color-border)] pt-3 text-[12px] text-[var(--color-text-secondary)]">
        <span className="shrink-0 whitespace-nowrap">{collection.postsCount} {collection.postsCount === 1 ? 'story' : 'stories'}</span><span aria-hidden="true">·</span><span className="min-w-0 [overflow-wrap:anywhere]">by {collection.author?.username}</span>
      </div>
      {shareOpen && <ShareMenu anchorRef={triggerRef} id={`collection-share-${collection.id}`} label="Share collection" contentName="Collection" url={`${window.location.origin}/collections/${collection.id}`} onClose={({ restoreFocus = false } = {}) => { setShareOpen(false); if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus()) }} />}
      {deleteOpen && <ModalLayer onDismiss={() => setDeleteOpen(false)} dismissOnBackdrop={false} returnFocusRef={triggerRef} aria-labelledby={`${deleteDialogId}-title`} className="flex items-center justify-center p-4 backdrop:bg-black/40">
        <section ref={deleteDialogRef} tabIndex="-1" className="w-full max-w-[420px] overflow-y-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-menu)]">
          <ModalHeader title="Delete collection?" titleId={`${deleteDialogId}-title`} onClose={() => setDeleteOpen(false)} closeLabel="Cancel delete" closeRef={deleteCloseRef} className="-mx-6 -mt-6" />
          <p className="mt-3 text-[13px] leading-5 text-[var(--color-text-secondary)]">This permanently removes “{collection.title}”. Stories in the collection are not deleted.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} disabled={remove.isPending} className="!bg-[var(--color-danger)] !border-[var(--color-danger)]" aria-busy={remove.isPending}>{'Delete collection'}</Button>
          </div>
        </section>
      </ModalLayer>}
    </article>
  )
}
