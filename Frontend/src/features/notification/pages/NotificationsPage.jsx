import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import useToast from '@/shared/hooks/useToast'
import Button from '@/shared/components/ui/Button'
import { ListSkeleton } from '@/shared/components/ui/Skeleton'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications'
import PageHeader from '@/shared/components/ui/PageHeader'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications, refetchInterval: 60000 })
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }), onError: () => notify('The notification could not be marked as read.', { tone: 'error' }) })
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); notify('All notifications marked as read.') }, onError: () => notify('Notifications could not be marked as read.', { tone: 'error' }) })
  const openNotification = async (event, item) => {
    if (item.readAt) return
    event.preventDefault()
    try {
      await markOne.mutateAsync(item._id)
      navigate(item.href)
    } catch {
      // The mutation owns user-facing error feedback. Keep the reader on the inbox when it fails.
    }
  }
  if (notifications.isLoading) return <main role="status" aria-label="Loading notifications" className="max-w-[760px] mx-auto px-6 md:px-8 pt-10 md:pt-12 pb-20"><ListSkeleton count={5} role={undefined} /></main>
  if (notifications.isError) return <main className="max-w-[760px] mx-auto px-6 md:px-8 pt-10 pb-20"><PageHeader eyebrow="Inbox" title="Notifications" /><div className="py-10"><p role="alert" className="text-[13px] text-[var(--color-danger)]">Notifications could not be loaded.</p><Button className="mt-4" variant="secondary" onClick={() => notifications.refetch()}>Try again</Button></div></main>
  const items = notifications.data?.data || []
  return <main className="max-w-[760px] mx-auto px-6 md:px-8 pt-10 pb-20"><PageHeader eyebrow="Inbox" title="Notifications" actions={notifications.data?.meta.unreadCount > 0 && <Button variant="secondary" disabled={markAll.isPending} onClick={() => markAll.mutate()}>Mark all read</Button>} />{items.length === 0 && <p className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">Answers, request updates, and competition results will appear here.</p>}<section>{items.map(item => <Link key={item._id} to={item.href} onClick={event => openNotification(event, item)} className={`flex w-full gap-4 border-b border-[var(--color-border)] py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 ${item.readAt ? 'opacity-65' : ''}`}><span aria-hidden="true" className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-transparent' : 'bg-[var(--color-accent)]'}`} /><div><h2 className="text-[14px] font-semibold text-[var(--color-text)]">{item.title}</h2>{item.body && <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{item.body}</p>}<p className="mt-2 text-[10px] text-[var(--color-text-muted)]">{new Date(item.createdAt).toLocaleString()}</p></div></Link>)}</section></main>
}
