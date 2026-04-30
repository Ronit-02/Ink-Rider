import { useState } from 'react'
import { colors, radius, transitions, fonts, fontSizes } from '@/styles/tokens'

function SummaryIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : colors.textMuted} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function AudioIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : colors.textMuted} strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  )
}

export function AIStickyButtons({ onSummary, onAudio, showSummary, readAloud }) {
  return (
    <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        onClick={onSummary}
        title="AI Summary"
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          background: showSummary ? colors.accent : colors.bgAlt,
          border: `1px solid ${showSummary ? colors.accent : colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: transitions.default,
        }}
      >
        <SummaryIcon active={showSummary} />
      </button>

      <button
        onClick={onAudio}
        title="Read Aloud"
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          background: readAloud ? colors.accent : colors.bgAlt,
          border: `1px solid ${readAloud ? colors.accent : colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: transitions.default,
        }}
      >
        <AudioIcon active={readAloud} />
      </button>
    </div>
  )
}

export function SummaryPanel() {
  return (
    <div
      style={{
        marginTop: 24,
        padding: 24,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
      }}
    >
      <p style={{ fontWeight: 600, fontSize: fontSizes.md, marginBottom: 10 }}>✦ AI Summary</p>
      <p style={{ fontSize: fontSizes.base, color: colors.textSecondary, lineHeight: 1.7 }}>
        The author reflects on returning to their childhood coastal town, discovering that familiarity
        had blinded them to its true character. Drawing on Simone Weil's concept of attention as
        generosity, they argue that truly seeing a familiar place requires deliberately shifting
        perspective — and that the town is stranger and richer than memory suggested.
      </p>
    </div>
  )
}

export function ReadAloudPanel() {
  return (
    <div
      style={{
        marginTop: 24,
        padding: '16px 20px',
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <button
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: colors.accent,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: 6 }}>On this page</p>
        <div style={{ height: 4, background: colors.bgAlt, borderRadius: 999 }}>
          <div style={{ width: '28%', height: '100%', background: colors.accent, borderRadius: 999 }} />
        </div>
      </div>
      <span style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>3:24 / 12:10</span>
    </div>
  )
}
