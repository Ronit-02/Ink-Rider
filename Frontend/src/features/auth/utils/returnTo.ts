export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\s\u0000-\u001f]/.test(value)) return '/'
  const url = new URL(value, 'https://ink-rider.invalid')
  if (url.origin !== 'https://ink-rider.invalid' || /^\/(login|signup)(\/|$)/.test(url.pathname)) return '/'
  return `${url.pathname}${url.search}${url.hash}`
}
