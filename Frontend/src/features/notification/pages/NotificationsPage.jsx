import ModalHeader from '@/shared/components/ui/ModalHeader'
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import retainRetryView from '@/shared/utils/retainRetryView'
import useToast from '@/shared/hooks/useToast'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import Button from '@/shared/components/ui/Button'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import ViewportPopover from '@/shared/components/ui/ViewportPopover'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const titleId = useId()
  const [anchor, setAnchor] = useState(undefined)
  const anchorRef = useMemo(() => ({ current: anchor }), [anchor])
  // Rebind the focus hook when responsive placement replaces the panel's DOM.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Ref identity must follow the placement anchor.
  const closeRef = useMemo(() => ({ current: null }), [anchor])
  useLayoutEffect(() => {
    const update = () => setAnchor(window.innerWidth >= 768 ? document.getElementById('notification-trigger') : null)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const onClose = useCallback(() => {
    if (location.state?.notificationBackground) navigate(-1)
    else navigate('/', { replace: true })
  }, [location.state, navigate])
  useEffect(() => {
    if (!anchor) return undefined
    const toggle = event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return
      event.preventDefault()
      onClose()
    }
    anchor.addEventListener('click', toggle)
    return () => anchor.removeEventListener('click', toggle)
  }, [anchor, onClose])
  const panelRef = useDialogFocus(onClose, closeRef, anchor !== undefined)
  useEffect(() => {
    if (anchor === undefined) return undefined
    const frame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [anchor, closeRef])
  useClickOutside(panelRef, () => { if (anchor) onClose() }, anchorRef)
  const { notify } = useToast()
  const queryClient = useQueryClient()
  // Keep the paginated inbox separate from Navbar's compact unread-count query.
  const notifications = retainRetryView(useInfiniteQuery({
    queryKey: ['notifications', 'inbox'],
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    initialPageParam: null,
    getNextPageParam: page => page.meta?.nextCursor || undefined,
    refetchInterval: 60000,
    retry: false,
  }))
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }), onError: () => notify('The notification could not be marked as read.', { tone: 'error' }) })
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }); notify('All notifications marked as read.') }, onError: () => notify('Notifications could not be marked as read.', { tone: 'error' }) })
  const openNotification = async (event, item) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    if (markOne.isPending || markAll.isPending) return
    try {
      if (!item.readAt) await markOne.mutateAsync(item._id)
      navigate(item.href)
    } catch {
      // The mutation owns error feedback; failed reads retain the inbox.
    }
  }
  const items = notifications.data?.pages.flatMap(page => page.data) || []
  const unreadCount = notifications.data?.pages[0]?.meta?.unreadCount || 0
  const content = <section ref={panelRef} tabIndex={-1} className={`flex w-full flex-col overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-float)] ${anchor ? 'max-h-[inherit]' : 'max-w-[420px]'}`}>
      <div className="shrink-0">
        <ModalHeader title="Inbox" titleId={titleId} onClose={onClose} closeLabel="Close notifications" closeRef={closeRef} />
        {unreadCount > 0 && <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] p-4"><p className="text-[13px] text-[var(--color-text-secondary)]">{unreadCount} unread</p><Button variant="secondary" disabled={markAll.isPending || markOne.isPending} onClick={() => markAll.mutate()} aria-busy={markAll.isPending}>Mark all read</Button></div>}
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
        {notifications.isLoading ? <div role="status" aria-label="Loading notifications" className="py-5"><ListSkeleton count={5} role={undefined} /></div>
          : notifications.isError && !notifications.data ? <div className="py-10"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Notifications could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => notifications.refetch()} aria-busy={notifications.isFetching} disabled={notifications.isFetching}>Try again</Button></div>
            : <>
              {items.length === 0 && <p className="py-8 text-center text-[13px] text-[var(--color-text-secondary)]">Answers, request updates, and competition results will appear here.</p>}
              <div>{items.map(item => <Link key={item._id} to={item.href} onClick={event => openNotification(event, item)} aria-disabled={markOne.isPending || markAll.isPending || undefined} aria-busy={markOne.isPending && markOne.variables === item._id} className={`flex w-full gap-4 border-b border-[var(--color-border)] py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-focus)] ${item.readAt ? 'opacity-65' : ''}`}><span aria-hidden="true" className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-transparent' : 'bg-[var(--color-accent)]'}`} /><div className="min-w-0 break-words"><h3 className="text-[14px] font-semibold text-[var(--color-text)]">{item.title}</h3>{item.body && <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{item.body}</p>}<p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">{!item.readAt && <span>Unread · </span>}<time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></p></div></Link>)}</div>
              {notifications.isFetchNextPageError && <p role="alert" className="mt-4 text-[13px] text-[var(--color-danger)]">Older notifications could not be loaded. Try Load more again.</p>}
              {notifications.isRefetchError && <p role="alert" className="mt-4 text-[13px] text-[var(--color-danger)]">Notifications could not be refreshed.<Button className="ml-3" variant="secondary" onClick={() => notifications.refetch()} aria-busy={notifications.isFetching} disabled={notifications.isFetching}>Try again</Button></p>}
              {notifications.hasNextPage && <Button className="mt-5" variant="secondary" onClick={() => notifications.fetchNextPage()} aria-busy={notifications.isFetchingNextPage} disabled={notifications.isFetching}>Load more</Button>}
            </>}
      </div>
    </section>
  if (anchor === undefined) return null
  return anchor ? <ViewportPopover anchorRef={anchorRef} preferredSide="bottom" onAnchorHidden={onClose} role="dialog" aria-labelledby={titleId} className="w-[360px] rounded-[14px]" style={{ maxHeight: 480 }}>{content}</ViewportPopover>
    : <ModalLayer aria-labelledby={titleId} onDismiss={onClose} className="flex items-center justify-center p-4">{content}</ModalLayer>
}
