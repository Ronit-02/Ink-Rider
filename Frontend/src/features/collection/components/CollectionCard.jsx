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
      if (!menuRef.current?.contains(event.target)) closeMenu()
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
    save.mutate(!collection.isSaved)
    closeMenu({ restoreFocus: true })
  }

  const share = async event => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/collections/${collection.id}`)
      notify('Collection link copied.')
    } catch {
      // Clipboard access is optional.
      notify('The collection link could not be copied.', { tone: 'error' })
    }
    closeMenu({ restoreFocus: true })
  }

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
    <article className="group relative flex h-[198px] min-h-0 overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div ref={menuRef} className="absolute right-3 top-3 z-10">
        <button ref={triggerRef} type="button" aria-label={`More options for ${collection.title}`} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuOpen ? menuId : undefined} onClick={event => { event.stopPropagation(); setMenuOpen(value => !value) }} className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text-secondary)]"><span aria-hidden="true" className="-mt-2 text-[20px] leading-none">…</span></button>
        {menuOpen && <div ref={actionMenuRef} id={menuId} role="menu" aria-label={`Options for ${collection.title}`} onKeyDown={handleMenuKeyDown} className="absolute right-0 top-10 w-52 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-menu)]">
          <button type="button" role="menuitem" onClick={toggleSave} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{collection.isSaved ? 'Remove from saved' : 'Save collection'}</button>
          <button type="button" role="menuitem" onClick={share} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Share link</button>
          {collection.isOwner && <button type="button" role="menuitem" onClick={requestDelete} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-danger)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Delete collection</button>}
          <button type="button" role="menuitem" onClick={event => { event.stopPropagation(); setHidden(true); setMenuOpen(false); notify('Collection hidden from this list.', { tone: 'info' }) }} className="min-h-10 sm:min-h-0 block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">Not interested</button>
        </div>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-5 pr-14">
        <div>
          <h2 className="line-clamp-2 text-[17px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}><Link to={`/collections/${collection.id}`} className="rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">{collection.title}</Link></h2>
          <p className="mt-3 line-clamp-3 text-[12px] leading-5 text-[var(--color-text-secondary)]">{collection.description || 'A curated reading collection.'}</p>
        </div>
        <div className="mt-5 flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
          <span>{collection.postsCount} stories</span><span>·</span><span>by {collection.author?.username}</span>
        </div>
      </div>
      <div className="w-[34%] shrink-0 overflow-hidden [&>div]:h-full [&>div]:transition-transform [&>div]:duration-200 group-hover:[&>div]:scale-[1.02]"><ImageBox src={collection.coverImage} alt="" height="100%" placeholderLabel="Reading collection" /></div>
      {deleteOpen && <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" role="presentation">
        <section ref={deleteDialogRef} role="dialog" aria-modal="true" aria-labelledby={`${deleteDialogId}-title`} tabIndex="-1" className="w-full max-w-[420px] rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-menu)]">
          <div className="flex items-start justify-between gap-4">
            <h2 id={`${deleteDialogId}-title`} className="text-[18px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Delete collection?</h2>
            <button ref={deleteCloseRef} type="button" aria-label="Cancel delete" onClick={() => setDeleteOpen(false)} className="rounded-full px-2 text-[22px] leading-none text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">×</button>
          </div>
          <p className="mt-3 text-[13px] leading-5 text-[var(--color-text-secondary)]">This permanently removes “{collection.title}”. Stories in the collection are not deleted.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} disabled={remove.isPending} className="!bg-[var(--color-danger)] !border-[var(--color-danger)]">{remove.isPending ? 'Deleting…' : 'Delete collection'}</Button>
          </div>
        </section>
      </div>}
    </article>
  )
}
