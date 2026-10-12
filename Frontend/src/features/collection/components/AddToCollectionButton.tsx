import { useRef, useState } from 'react'
import useAuth from '@/features/auth/hooks/useAuth'
import Button from '@/shared/components/ui/Button'
import AddToCollectionDialog from './AddToCollectionDialog'

export function CollectionActionIcon() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18v14H3zM7 3h10M12 10v8M8 14h8" /></svg>
}

export default function AddToCollectionButton({ postId, title, compactLabel = false }: { postId: string; title: string; compactLabel?: boolean }) {
  const { loggedIn, signIn } = useAuth()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return <>
    <Button ref={triggerRef} variant="action" size={compactLabel ? 'sm' : 'md'} className={compactLabel ? '!min-h-11 !px-1' : '!min-h-11 !px-2'} leadingIcon={<CollectionActionIcon />} aria-label={compactLabel ? 'Add to collection' : undefined} aria-haspopup="dialog" aria-expanded={open} onClick={() => loggedIn ? setOpen(true) : signIn()}>{compactLabel ? 'Add' : 'Add to collection'}</Button>
    {open && <AddToCollectionDialog postId={postId} title={title} returnFocusRef={triggerRef} onClose={() => setOpen(false)} />}
  </>
}
