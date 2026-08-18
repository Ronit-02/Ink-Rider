import { useState } from 'react'

const isSafeImageUrl = value => {
  if (typeof value !== 'string' || value.length > 2_048) return false

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
      && Boolean(url.hostname)
      && !url.username
      && !url.password
  } catch {
    return false
  }
}

function ImageBlock({ item }) {
  const [hasError, setHasError] = useState(!isSafeImageUrl(item.content))
  const label = item.alt || 'Image unavailable'

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={label}
        className="mb-6 flex min-h-24 items-center justify-center rounded-lg bg-(--color-bg-alt) px-4 py-6 text-center text-[13px] text-(--color-text-muted)"
      >
        Image unavailable
      </div>
    )
  }

  return (
    <div className="mb-6">
      <img
        src={item.content}
        alt={item.alt || ''}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="w-full rounded-lg"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

const renderBlock = (item, compact) => {
  // const commonProps = { key: item.id };

  switch (item.type) {
    case 'text':
      return (
        <p
          key={item.id}
          className={`${compact ? 'text-[15px]' : 'text-[17px]'} break-words leading-[1.82] mb-5 text-(--color-text)`}
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {item.content}
        </p>
      );

    case 'h1':
      return (
        <h1
          key={item.id}
          className="break-words text-[28px] font-bold leading-[1.3] mb-6 text-(--color-text)"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.content}
        </h1>
      );

    case 'h2':
      return (
        <h2
          key={item.id}
          className="break-words text-[24px] font-semibold leading-[1.35] mb-5 text-(--color-text)"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.content}
        </h2>
      );

    case 'h3':
      return (
        <h3
          key={item.id}
          className="text-[20px] font-semibold leading-[1.4] mb-4 text-(--color-text)"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.content}
        </h3>
      );

    case 'quote':
      return (
        <blockquote
          key={item.id}
          className="border-l-4 pl-4 italic mb-5 text-(--color-text) opacity-80"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {item.content}
        </blockquote>
      );

    case 'code':
      return (
        <pre
          key={item.id}
          className="bg-[#f4f4f4] p-4 rounded-lg mb-5 overflow-x-auto text-[13px]"
        >
          <code>{item.content}</code>
        </pre>
      );

    case 'image':
      return <ImageBlock key={item.id} item={item} />

    case 'divider':
      return (
        <hr
          key={item.id}
          className="my-8 border-t border-gray-300"
        />
      );

    default:
      return null;
  }
};

export default function PostBody({ body, compact = false }) {
  const blocks = Array.isArray(body) ? body : []

  return <div data-reading-body={compact ? 'compact' : 'long-form'}>{blocks.map(block => renderBlock(block, compact))}</div>;
}
