/* AuthorMeta — avatar + name + date + read time row */
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar'

export default function AuthorMeta({ author, readTime, date, size = 'sm' }) {
  const navigate = useNavigate()
  const textSize  = size === 'sm' ? 'text-[12px]' : 'text-[13px]'
  const avatarSz  = size === 'sm' ? 22 : 28

  const goToAuthor = (e) => {
    e.stopPropagation()
    navigate('/author')
  }

  return (
    <div className="flex items-center flex-wrap justify-between gap-1">
      {/* Author name + avatar — clickable */}
      <button
        onClick={goToAuthor}
        className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
      >
        <Avatar src={author.picture} name={author.username} size={avatarSz} />
        <span className={`${textSize} text-(--color-text-secondary) font-medium hover:text-(--color-text) transition-colors capitalize`}>
          {author.username}
        </span>
      </button>

      <span className={`text-(--color-text-muted)`}>·</span>

      {/* Meta: date + read time */}
      <div className={`flex items-center gap-1.5 ${textSize} text-(--color-text-muted)`}>
        {date && <>
          <span>{ new Date(date).toLocaleString('en-GB', {day:'numeric', month: 'long', year:'numeric'})}</span>
          <span>·</span>
        </>}
        {readTime && <span>{readTime}</span>}
      </div>
    </div>
  )
}
