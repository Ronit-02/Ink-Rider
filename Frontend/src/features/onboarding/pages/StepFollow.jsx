import { authors } from '@/shared/data'
import Button from '@/shared/components/ui/Button'

export default function StepFollow({ selected, onToggle }) {
  return (
    <div>
      {authors.slice(0, 6).map(author => (
        <div key={author.id}
          className="flex items-center gap-[14px] py-3 border-b border-[var(--color-border)]">
          <img src={author.avatar} alt={author.name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px] mb-0.5 text-[var(--color-text)]">{author.name}</p>
            <p className="text-[12px] text-[var(--color-text-muted)] truncate">{author.bio}</p>
          </div>
          <Button variant={selected.includes(author.id) ? 'secondary' : 'primary'}
            onClick={() => onToggle(author.id)}
            className="text-[12px] flex-shrink-0">
            {selected.includes(author.id) ? 'Following' : 'Follow'}
          </Button>
        </div>
      ))}
    </div>
  )
}
