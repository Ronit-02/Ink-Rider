import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articles } from '@/data'
import { colors, radius, fonts, fontSizes, transitions } from '@/styles/tokens'
import AuthorMeta from '@/components/ui/AuthorMeta'
import Tag from '@/components/ui/Tag'
import Divider from '@/components/ui/Divider'
import PostBody from './PostBody'
import AuthorBio from './AuthorBio'
import { AIStickyButtons, SummaryPanel, ReadAloudPanel } from './AIPanel'

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const article = articles.find((a) => a.id === Number(id)) ?? articles[0]

  const [bookmarked, setBookmarked] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [readAloud, setReadAloud] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    setScrollProgress(progress);
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSummary = () => {
    setShowSummary((v) => !v)
    setReadAloud(false)
  }

  const handleAudio = () => {
    setReadAloud((v) => !v)
    setShowSummary(false)
  }

  const hasSidePanel = showSummary || readAloud;

  return (
    <div
      style={{
        position: 'relative',
        background: colors.bg,
        color: colors.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Reading progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0 + 56,
          left: 0 + 180,
          width: '100%',
          height: 3,
          background: colors.bgAlt,
          borderRadius: 999,
          marginBottom: 40,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: `${scrollProgress}%`,
            height: '100%',
            background: colors.accent,
            borderRadius: 999,
          }}
        />
      </div>

      {/* Main content */}
      <div style={{ 
        maxWidth: showSummary || readAloud ? 1300 : 900,
        margin: '0 auto', 
        padding: '40px 32px 80px',
        display: 'flex',
        gap: 32,
        position: 'relative',
        alignItems: 'flex-start',
      }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 'fit-content',
            gap: 6,
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            fontSize: fontSizes.base,
            cursor: 'pointer',
            marginBottom: 32,
            padding: 0,
            transition: transitions.default,
          }}
        >
          <BackIcon />
          Back
        </button>


        {/* Main layout: article + sticky AI buttons */}
        <div style={{ display: 'flex', gap: 32, flex: 1 }}>
          {/* Article content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tags */}
            {article.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {article.tags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: fontSizes['3xl'],
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1.3,
                letterSpacing: '-0.5px',
                marginBottom: 20,
              }}
            >
              {article.title}
            </h1>

            {/* Author row + actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                gap: 16,
              }}
            >
              <AuthorMeta
                author={article.author}
                readTime={article.readTime}
                date={article.date}
                size="md"
              />
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setBookmarked((v) => !v)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: `1px solid ${colors.border}`,
                    background: bookmarked ? colors.accent : colors.surface,
                    color: bookmarked ? 'white' : colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: transitions.default,
                  }}
                >
                  <BookmarkIcon />
                </button>
                <button
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ShareIcon />
                </button>
              </div>
            </div>

            <Divider style={{ marginBottom: 24 }} />

            {/* Hero image */}
            <img
              src={article.image}
              alt={article.title}
              style={{
                width: '100%',
                height: 320,
                objectFit: 'cover',
                borderRadius: radius.xl,
                marginBottom: 32,
                display: 'block',
              }}
            />

            {/* Body */}
            <PostBody />

            {/* Author bio */}
            <AuthorBio author={article.author} />
          </div>

          {/* Sticky AI buttons */}
          <div style={{ width: 52, flexShrink: 0 }}>
            <AIStickyButtons
              showSummary={showSummary}
              readAloud={readAloud}
              onSummary={handleSummary}
              onAudio={handleAudio}
            />
          </div>
        </div>

        {/* Side AI panels */}
        {hasSidePanel && (
        <div
          style={{
            position: "sticky",
            top: 80,
            width: 400,
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {showSummary && <SummaryPanel />}
          {readAloud && <ReadAloudPanel />}
        </div>
      )}
      </div>
    </div>
  )
}
