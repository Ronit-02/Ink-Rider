import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BackIcon, BookmarkIcon, ShareIcon, LinkIcon, XIcon } from '@/shared/icons'
import AuthorMeta from '@/shared/components/ui/AuthorMeta'
import Tag from '@/shared/components/ui/Tag'
import Divider from '@/shared/components/ui/Divider'
import { LightLoader } from '@/shared/components/layout/Loader'
import PostBody from './PostBody'
import AuthorBio from './AuthorBio'
import CommentsSection from './CommentsSection'
import { AIStickyButtons, SummaryPanel, ReadAloudPanel } from './AIPanel'
import useFetchPost from '../hooks/useFetchPost'
import useBookmarkPost from '../hooks/useBookmarkPost'
import useReadingProgress from '../hooks/useProgressBar'

export default function PostPage() {
  const navigate  = useNavigate()
  const { id: postId } = useParams();

  // UI State
  const [showSummary, setShowSummary] = useState(false)
  const [readAloud,   setReadAloud]   = useState(false)
  const [showShare,   setShowShare]   = useState(false)

  // Hooks
  const { data: postData, isLoading: fetchPostIsLoading, isError, error } = useFetchPost(postId); 
  const BookmarkMutation = useBookmarkPost(postId);
  const progress = useReadingProgress();

  // Close share menu on outside click
  useEffect(() => {
    if (!showShare) return
    const close = () => setShowShare(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showShare])

  const hasSidePanel = showSummary || readAloud

  const handleBookmark = () => {
    BookmarkMutation.mutate({ postId });
  }

  // Conditional Rendering
  if (fetchPostIsLoading) return <LightLoader />;
  if (isError) return <div>{error?.response?.data?.message || error.message}</div>;

  return (
    <div className="relative bg-(--color-bg) text-(--color-text) min-h-screen">

      {/* ── Reading progress bar (full width, below navbar) ── */}
      <div className="fixed top-14 left-0 right-0 h-0.75 bg-(--color-bg-alt) z-10">
        <div className="h-full bg-(--color-accent) transition-[width] duration-100"
          style={{ width: `${progress}%` }} />
      </div>

      {/* ── Page body — LEFT aligned (matches sidebar layout) ── */}
      <div className={`px-6 pt-8 pb-20 flex gap-8 ${hasSidePanel ? 'max-w-300' : 'max-w-200'}`}>

        {/* ── Article column ── */}
        <div className="flex-1 min-w-0">

          {/* Back button */}
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 bg-(--color-bg-alt) border border-(--color-border) text-(--color-text-secondary) text-[13px] cursor-pointer mb-7 px-3.5 py-1.5 rounded-full transition-all hover:bg-(--color-border)">
            <BackIcon /> 
            Back
          </button>

          {/* Tags */}
          {postData.tags?.length > 0 && (
            <div className="flex gap-1.5 mb-3.5 flex-wrap">
              {postData.tags.map(t => <Tag key={t} label={t} clickable />)}
            </div>
          )}

          {/* Hero image */}
          <img src={postData.coverImage} alt={postData.title}
            className="w-full object-cover rounded-[20px] mb-8 block"
            style={{ height: 'clamp(180px, 30vw, 320px)' }} 
          />

          {/* Title */}
          <h1 className="font-bold text-(--color-text) leading-[1.3] tracking-[-0.5px] mb-5 text-[clamp(22px,4vw,32px)]"
            style={{ fontFamily: 'var(--font-display)' }}>
            {postData.title}
          </h1>

          {/* Author row + actions */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <AuthorMeta author={postData.author} readTime={postData?.readTime || '5 mins'} date={postData.createdAt} size="md" />

            <div className="flex gap-2 shrink-0">
              
              {/* Bookmark */}
              <button onClick={handleBookmark}
                className={`w-9 h-9 rounded-full border border-(--color-border) flex items-center justify-center cursor-pointer transition-all duration-150
                  ${postData.isBookmarked ? 'bg-(--color-accent) text-white' : 'bg-(--color-surface) text-(--color-text-secondary)'}`}>
                <BookmarkIcon filled={postData.isBookmarked} />
              </button>
              
              {/* Share */}
              <div className="relative">
                <button onClick={e => { e.stopPropagation(); setShowShare(v => !v) }}
                  className="w-9 h-9 rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) flex items-center justify-center cursor-pointer transition-all">
                  <ShareIcon />
                </button>
                {showShare && <ShareDropdown onClose={() => setShowShare(false)} />}
              </div>
            </div>
            
          </div>

          <Divider className="mb-6" />

          {/* Body */}
          <PostBody body={JSON.parse(postData.body)} />

          <Divider className="my-10" />

          {/* Author bio */}
          <AuthorBio author={postData.author._id} />

          <Divider className="my-10" />

          {/* Comments (renamed from Responses) */}
          <CommentsSection articleId={postData.comments} />
        </div>

        {/* ── AI sticky buttons ── */}
        <div className="w-13 shrink-0">
          <AIStickyButtons
            showSummary={showSummary} readAloud={readAloud}
            onSummary={() => { setShowSummary(v => !v); setReadAloud(false) }}
            onAudio={() => { setReadAloud(v => !v); setShowSummary(false) }}
          />
        </div>

        {/* ── Side AI panels ── */}
        {hasSidePanel && (
          <div className="sticky top-20 w-90 h-fit flex flex-col gap-3 shrink-0">
            {showSummary && <SummaryPanel />}
            {readAloud   && <ReadAloudPanel />}
          </div>
        )}
      </div>
    </div>
  )
}

function ShareDropdown({ onClose }) {
  const url = window.location.href
  const copyLink = () => { 
    navigator.clipboard.writeText(url); 
    onClose()
  }
  const shareX = () => { 
    window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}`); 
    onClose() 
  }

  const SHARE_MENU = [
    { label: 'Copy Link', icon: <LinkIcon />, fn: copyLink }, 
    { label: 'Share on X', icon: <XIcon />, fn: shareX }
  ]

  return (
    <div className="absolute top-full right-0 mt-1.5 bg-(--color-surface) border border-(--color-border) rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden z-50 min-w-45">
      {SHARE_MENU.map(item => (
        <button key={item.label} onClick={item.fn}
          className="flex items-center gap-2.5 w-full px-3.5 py-2.5 border-none bg-transparent text-(--color-text) text-[13px] cursor-pointer text-left hover:bg-(--color-bg-alt) transition-colors">
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  )
}