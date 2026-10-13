import ShortCard from '@/features/discovery/components/ShortCard'
import WritingPostMenu from './WritingPostMenu'

const postStatus = post => post.publicationStatus === 'unpublished' ? 'unpublished' : post.publicAt && new Date(post.publicAt).getTime() > Date.now() ? 'scheduled' : 'published'

export default function WritingStudioShortCard({ post }) {
  const status = postStatus(post)
  const label = status === 'unpublished' ? 'Unpublished' : status === 'scheduled' ? `Scheduled for ${new Date(post.publicAt).toLocaleString()}` : 'Published'
  const cardPost = { ...post, id: post._id || post.id, image: post.image || post.coverImage }

  return (
    <div className="min-w-0">
      <ShortCard post={cardPost} fluid menuOverride={<WritingPostMenu post={post} />} />
      <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}
