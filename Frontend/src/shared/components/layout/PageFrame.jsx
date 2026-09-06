export default function PageFrame({ children, className = '' }) {
  return (
    <main className={`mx-auto w-full max-w-[1120px] min-w-0 px-4 pt-8 pb-24 sm:px-5 md:px-8 md:pt-12 ${className}`}>
      {children}
    </main>
  )
}
