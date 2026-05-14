import { useState, useEffect, useRef } from 'react'

export default function SlashMenu({
  options = [],
  position = { x: 0, y: 0 },
  onSelect,
  onClose,
  filter = '',
}) {
  const [selected, setSelected] = useState(0)
  const menuRef = useRef()

  // Filter options
  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(filter.toLowerCase()) ||
      opt.type.toLowerCase().includes(filter.toLowerCase())
  )

  useEffect(() => {
    setSelected(0)
  }, [filter, options])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % filtered.length)
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + filtered.length) % filtered.length)
        e.preventDefault()
      } else if (e.key === 'Enter') {
        if (filtered[selected]) {
          onSelect(filtered[selected])
        }
        e.preventDefault()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [filtered, selected, onSelect, onClose])

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (!filtered.length) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        minWidth: 220,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 8,
      }}
    >
      {filtered.map((opt, i) => (
        <div
          key={opt.type}
          onClick={() => onSelect(opt)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: i === selected ? 'var(--color-bg-alt)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          <span style={{ width: 28, display: 'inline-block', textAlign: 'center' }}>{opt.icon}</span>
          {opt.label}
        </div>
      ))}
    </div>
  )
}
