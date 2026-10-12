import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionMenu, { ActionMenuTrigger, ActionMenuItem } from '@/shared/components/ui/ActionMenu'
import DeletePostDialog from './DeletePostDialog'
import PenIcon from '@/shared/icons/PenIcon'
import useToast from '@/shared/hooks/useToast'
import { setPostPublication } from '../api/profile'

export default function WritingPostMenu({ post }) {
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState(null)
  const triggerRef = useRef(null)
  const menuId = useId()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const publication = useMutation({ mutationFn: setPostPublication, onSuccess: async (_, input) => { await queryClient.invalidateQueries({ queryKey: ['me', 'posts'] }); closeMenu({ restoreFocus: true }); notify(input.status === 'published' ? 'Post republished.' : 'Post unpublished.') }, onError: () => notify('The post publication status could not be updated.', { tone: 'error' }) })
  const closeMenu = ({ restoreFocus = false } = {}) => {
    setOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  const closeDialog = () => { setDialog(null); requestAnimationFrame(() => triggerRef.current?.focus()) }
  const openDialog = value => { closeMenu(); setDialog(value) }
  const id = post._id || post.id
  return <>
    <ActionMenuTrigger ref={triggerRef} aria-label={`Manage ${post.title}`} aria-expanded={open} aria-controls={open ? menuId : undefined} disabled={publication.isPending} onClick={() => setOpen(value => !value)} />
    {open && <ActionMenu id={menuId} label={`Manage ${post.title}`} anchorRef={triggerRef} onClose={closeMenu}>
      <ActionMenuItem icon={<PenIcon />} disabled={publication.isPending} onClick={() => navigate(`/write?edit=${id}`)}>Edit</ActionMenuItem>
      <ActionMenuItem icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 16v4h16v-4" /><path d={post.publicationStatus === 'unpublished' ? 'M12 16V4m-5 5 5-5 5 5' : 'M12 4v12m-5-5 5 5 5-5'} /></svg>} disabled={publication.isPending} aria-busy={publication.isPending} onClick={() => publication.mutate({ postId: id, status: post.publicationStatus === 'unpublished' ? 'published' : 'unpublished' })}>{post.publicationStatus === 'unpublished' ? 'Republish' : 'Unpublish'}</ActionMenuItem>
      <ActionMenuItem icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></svg>} tone="danger" disabled={publication.isPending} onClick={() => openDialog('delete')}>Delete post</ActionMenuItem>
    </ActionMenu>}
    {dialog === 'delete' && <DeletePostDialog post={{ ...post, _id: id }} onClose={closeDialog} />}
  </>
}
