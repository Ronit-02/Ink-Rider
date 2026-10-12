export default function PageFrame({ children, className = '' }) {
  return (
    <main data-page-frame="true" className={`app-page-frame min-w-0 pt-8 pb-24 md:pt-12 ${className}`}>
      {children}
    </main>
  )
}
