/**
 * Capitalize the first alphabetic character without changing the rest of the
 * user-provided text. This keeps punctuation, whitespace, acronyms, and
 * intentional casing intact while giving displayed titles and names a
 * consistent leading capital.
 */
export default function capitalizeFirstAlphabetic(value) {
  if (typeof value !== 'string' || !value) return value
  return value.replace(/\p{L}/u, character => character.toUpperCase())
}

const DISPLAY_KEYS = new Set(['title', 'username', 'displayName'])

/** Normalize API response presentation fields without mutating the response. */
export function normalizeDisplayText(value) {
  if (Array.isArray(value)) return value.map(normalizeDisplayText)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    DISPLAY_KEYS.has(key) ? capitalizeFirstAlphabetic(item) : normalizeDisplayText(item),
  ]))
}
