// ─── Color Palette ─────────────────────────────────────────────────────────────
// These reference CSS custom properties defined in global.css
// so dark mode works automatically via the .dark class
export const colors = {
  bg:           'var(--color-bg)',
  bgAlt:        'var(--color-bg-alt)',
  surface:      'var(--color-surface)',
  surfaceHover: 'var(--color-surface-hover)',
  border:       'var(--color-border)',
  borderLight:  'var(--color-border-light)',
  text:         'var(--color-text)',
  textSecondary:'var(--color-text-secondary)',
  textMuted:    'var(--color-text-muted)',
  textInverted: 'var(--color-text-inverted)',
  accent:       'var(--color-accent)',
  accentHover:  'var(--color-accent-hover)',
}

// ─── Typography ────────────────────────────────────────────────────────────────
export const fonts = {
  display: "var(--font-display, 'Libre Baskerville', Georgia, serif)",
  sans:    "var(--font-sans, 'DM Sans', 'Helvetica Neue', sans-serif)",
}

export const fontSizes = {
  xxs:  '10px',
  xs:   '11px',
  sm:   '12px',
  base: '13px',
  md:   '14px',
  lg:   '16px',
  xl:   '18px',
  '2xl':'22px',
  '3xl':'28px',
  '4xl':'36px',
}

// ─── Spacing ───────────────────────────────────────────────────────────────────
export const spacing = {
  1:  '4px',  2:  '8px',  3:  '12px', 4:  '16px',
  5:  '20px', 6:  '24px', 8:  '32px', 10: '40px',
  12: '48px', 16: '64px',
}

// ─── Border Radius ─────────────────────────────────────────────────────────────
export const radius = {
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  full: '999px',
}

// ─── Transitions ───────────────────────────────────────────────────────────────
export const transitions = {
  default: 'all 0.15s ease',
  slow:    'all 0.25s ease',
}
