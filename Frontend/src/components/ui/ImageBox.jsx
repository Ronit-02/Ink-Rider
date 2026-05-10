/* ImageBox — lazy-loaded image container with configurable radius */
export default function ImageBox({ src, alt = '', height = 180, radius = '0px', style = {} }) {
  return (
    <div
      className="w-full overflow-hidden bg-[var(--color-bg-alt)] shrink-0"
      style={{ height, borderRadius: radius, ...style }}
    >
      {src && (
        <img src={src} alt={alt} loading="lazy"
          className="w-full h-full object-cover block" />
      )}
    </div>
  )
}
