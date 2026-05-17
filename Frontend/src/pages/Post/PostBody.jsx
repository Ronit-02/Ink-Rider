const renderBlock = (item) => {
  // const commonProps = { key: item.id };

  switch (item.type) {
    case 'text':
      return (
        <p
          key={item.id}
          className="text-[15px] leading-[1.82] mb-5 text-(--color-text)"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {item.content}
        </p>
      );

    case 'h1':
      return (
        <h1
          key={item.id}
          className="text-[28px] font-bold leading-[1.3] mb-6 text-(--color-text)"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.content}
        </h1>
      );

    case 'h2':
      return (
        <h2
          key={item.id}
          className="text-[24px] font-semibold leading-[1.35] mb-5 text-(--color-text)"
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
      return (
        <div key={item.id} className="mb-6">
          <img
            src={item.content}
            alt=""
            className="w-full rounded-lg"
          />
        </div>
      );

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

export default function PostBody({ body }) {
  return <div>{body.map(renderBlock)}</div>;
}