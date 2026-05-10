/* Avatar — circular user image with initials fallback */
export default function Avatar({ src, name = '', size = 32 }) {
  const px = `${size}px`
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={src} alt={name} loading="lazy"
        className="rounded-full object-cover shrink-0 border border-[var(--color-border-light)] block"
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <div
      className="rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center font-semibold text-[var(--color-text-secondary)] shrink-0"
      style={{ width: px, height: px, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}
