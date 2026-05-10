/* StepInterests — toggle interest pills */
const ALL_INTERESTS = [
  'Fiction', 'Poetry', 'Essays', 'Technology', 'Science',
  'Arts & Culture', 'History', 'Travel', 'Food', 'Philosophy',
  'Comedy', 'Politics', 'Design', 'Music', 'Wellness', 'Finance',
]

export default function StepInterests({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_INTERESTS.map(item => {
        const active = selected.includes(item)
        return (
          <button key={item} onClick={() => onToggle(item)}
            className={`px-4 py-2 rounded-full border text-[13px] font-medium cursor-pointer transition-all duration-150
              ${active
                ? 'bg-[var(--color-accent)] text-[var(--color-text-inverted)] border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}>
            {item}
          </button>
        )
      })}
    </div>
  )
}
