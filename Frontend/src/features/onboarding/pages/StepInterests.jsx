export default function StepInterests({ topics, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map(topic => {
        const active = selected.includes(topic.slug)
        return (
          <button key={topic.slug} type="button" onClick={() => onToggle(topic.slug)} aria-pressed={active}
            className={`px-4 py-2 rounded-full border text-[13px] font-medium cursor-pointer transition-all duration-150
              ${active
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}>
            {topic.displayName}
          </button>
        )
      })}
    </div>
  )
}
