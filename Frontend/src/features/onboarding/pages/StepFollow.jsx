import Button from '@/shared/components/ui/Button'
import Avatar from '@/shared/components/ui/Avatar'

export default function StepFollow({ writers, selected, onToggle }) {
  return (
    <div>
      {writers.map(writer => (
        <div key={writer.id}
          className="flex items-center gap-[14px] py-3 border-b border-[var(--color-border)]">
          <Avatar src={writer.avatarUrl} name={writer.displayName} size={44} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px] mb-0.5 text-[var(--color-text)]">{writer.displayName}</p>
            <p className="text-[12px] text-[var(--color-text-muted)] truncate">{writer.bio || `@${writer.handle}`}</p>
          </div>
          <Button variant={selected.includes(String(writer.id)) ? 'secondary' : 'primary'}
            onClick={() => onToggle(String(writer.id))}
            className="text-[12px] flex-shrink-0">
            {selected.includes(String(writer.id)) ? 'Selected' : 'Select'}
          </Button>
        </div>
      ))}
      {writers.length === 0 && <p className="py-8 text-[13px] text-[var(--color-text-muted)] text-center">No writer suggestions are available yet. You can continue and follow writers later.</p>}
    </div>
  )
}
