import { useState, useRef, forwardRef } from 'react'
import SlashMenu from '@/components/ui/SlashMenu'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import Button from '@/components/ui/Button'
import createPost from '@/api/post/createPost'
// import Tag from '@/components/ui/Tag'

// Block Input Types
const BLOCK_TYPES = [
  { type: 'text',    label: 'Text',       icon: '¶' },
  { type: 'h1',      label: 'Heading 1',  icon: 'H1' },
  { type: 'h2',      label: 'Heading 2',  icon: 'H2' },
  { type: 'h3',      label: 'Heading 3',  icon: 'H3' },
  { type: 'quote',   label: 'Quote',      icon: '❝' },
  { type: 'code',    label: 'Code',       icon: '</>' },
  { type: 'image',   label: 'Image URL',  icon: '🖼' },
  { type: 'divider', label: 'Divider',    icon: '—' },
]

// Adding a new block
function newBlock(type = 'text') {
  return { 
    id: uuid(), 
    type, 
    content: '' 
  }
}

// Write Page
export default function WritePage() {

  // State and refs
  const navigate  = useNavigate()
  const [title,   setTitle]   = useState('')
  const [blocks,  setBlocks]  = useState([newBlock()])
  const [slashMenu, setSlashMenu] = useState({ 
    open: false, 
    blockId: null, 
    position: { x: 0, y: 0 }, 
    filter: '' 
  })
  const [tags,    setTags]    = useState([])
  const [tagInput,setTagInput]= useState('')
  const [cover,   setCover]   = useState(null)
  const [coverURL, setCoverURL] = useState('')
  const [saved,   setSaved]   = useState(false)
  const fileRef   = useRef()
  const blockRefs  = useRef({})

  // Creating Post
  const { mutate, isLoading } = useMutation({
    mutationFn: createPost,
    onSuccess: (response) => {
      navigate(`/post/${response.postId}`);
      // displayNotification(response.message);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'An error occurred while creating the post.';
      // displayNotification(message, 'error');
    },
  });
  
  // Submitting Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('coverURL', coverURL);
    formData.append('title', title);
    formData.append('body', JSON.stringify(blocks));
    formData.append('tags', tags);
    mutate(formData);
  };
  
  // Saving as Draft
  const handleSave = () => { 
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000) 
  }
  
  // Input Handlers
  const handleCoverImage = (e) => {
    const f = e.target.files[0];
    if (f){
      setCoverURL(f)
      setCover(URL.createObjectURL(f));
      
    } 
  }

  // Tag operations
  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) { 
      setTags(v => [...v, t]);
      setTagInput('') 
    }
  }

  // Block update and edit operations
  const updateBlock = (id, val) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, content: val } : bl))
  } 
  const deleteBlock = (id) => {
    // Prevent deleting the last block
    if(blocks.length === 1) return;

    const idx = blocks.findIndex(bl => bl.id === id);
    const prevId = idx > 0 ? blocks[idx - 1].id : blocks[1].id;

    setBlocks(b => b.length > 1 ? b.filter(bl => bl.id !== id) : b)

    // Focus on the previous block after deletion
    setTimeout(() => {
      blockRefs.current[prevId]?.focus();
    }, 0);
  }
  const addAfter = (id) => {
    const newBlk = newBlock();

    setBlocks(b => {
      const i = b.findIndex(bl => bl.id === id); 
      if(i === -1) return b;
      
      const nb = [...b];
      nb.splice(i + 1, 0, newBlk);
      
      return nb;
    })

    // Focus on the new block after state update
    setTimeout(() => {
      blockRefs.current[newBlk.id]?.focus();
    }, 0);
  }
  const changeType = (id, type) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, type } : bl))
  }
  const addDivider = () => {
    setBlocks(b => [...b, newBlock('divider'), newBlock()])
  }

  // Slash menu handlers
  const openSlashMenu = (blockId, position, filter = '') => {
    setSlashMenu({ open: true, blockId, position, filter })
  }
  const closeSlashMenu = () => {
    setSlashMenu({ open: false, blockId: null, position: { x: 0, y: 0 }, filter: '' })
  }
  const handleSlashSelect = (item) => {
    console.log('Handle select')
    if (slashMenu.blockId && item) {
      changeType(slashMenu.blockId, item.type)
      // Optionally clear the "/" and filter from content
      setBlocks(b => b.map(bl => bl.id === slashMenu.blockId ? { ...bl, content: bl.content.replace(/^\/.*/, '') } : bl))
    }
    closeSlashMenu()
    // Refocus block
    setTimeout(() => {
      blockRefs.current[slashMenu.blockId]?.focus()
    }, 0)
  }

  return (
    <div className="max-w-185 px-8 pt-10 pb-20">
      
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <button 
          className="inline-flex items-center gap-1.5 bg-(--color-bg-alt) border border-(--color-border) text-(--color-text-secondary) text-[13px] cursor-pointer px-3.5 py-1.5 rounded-full transition-all hover:bg-(--color-border)"
          onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSave}>
            {saved ? "✓ Saved" : "Save Draft"}
          </Button>
          <Button 
            variant="primary"
            disabled={!title.trim() || isLoading}
            onClick={handleSubmit}>
            Publish
          </Button>
        </div>
      </div>

      {/* ── Cover image ── */}
      <div className="mb-7">
        {cover ? (
          <div className="relative">
            <img src={cover} alt="cover" className="w-full h-60 object-cover rounded-[14px] block"/>
            <button
              onClick={() => setCover(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white border-none cursor-pointer flex items-center justify-center text-[18px]">
              ×
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full h-40 rounded-[14px] border-2 border-dashed border-(--color-border) flex items-center justify-center text-(--color-text-muted) text-[13px] font-medium cursor-pointer bg-transparent hover:bg-(--color-bg-alt) transition-colors">
            + Add Cover Image
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverImage}
        />
      </div>

      {/* ── Title input ── */}
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title…"
        className="w-full bg-transparent border-none outline-none resize-none font-bold text-[clamp(24px,4vw,36px)] leading-[1.3] tracking-[-0.5px] mb-8 text-(--color-text) placeholder:text-(--color-text-muted)"
        style={{ fontFamily: "var(--font-display)", minHeight: "1.3em" }}
        rows={1}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
      />

      {/* ── Block editor ── */}
      <div className="flex flex-col gap-2 mb-8 relative">
        {blocks.map((bl) => (
          <Block
            key={bl.id}
            block={bl}
            onChange={(v) => updateBlock(bl.id, v)}
            onDelete={() => deleteBlock(bl.id)}
            onAdd={() => addAfter(bl.id)}
            onTypeChange={(t) => changeType(bl.id, t)}
            openSlashMenu={openSlashMenu}
            closeSlashMenu={closeSlashMenu}
            ref={(el) => blockRefs.current[bl.id] = el}
            isSlashMenuOpen={slashMenu.open}
          />
        ))}

        {slashMenu.open && (
          <SlashMenu
            options={BLOCK_TYPES.filter(b => b.type !== 'divider' || blocks.length > 1)}
            position={slashMenu.position}
            filter={slashMenu.filter}
            onSelect={handleSlashSelect}
            onClose={closeSlashMenu}
          />
        )}

      </div>

      {/* ── Toolbar ── */}
      {/* <div className="flex gap-2 mb-8 flex-wrap">
        {BLOCK_TYPES.map((bt) => (
          <button
            key={bt.type}
            onClick={() =>
              bt.type === "divider"
                ? addDivider()
                : setBlocks((b) => [...b, newBlock(bt.type)])
            }
            className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-bg-alt) text-[12px] text-(--color-text-secondary) cursor-pointer hover:bg-(--color-surface) transition-colors font-medium"
          >
            {bt.icon} {bt.label}
          </button>
        ))}
      </div> */}

      {/* ── Tags ── */}
      <div className="p-4 bg-(--color-bg-alt) rounded-[14px] border border-(--color-border)">
        <p className="text-[11px] font-bold text-(--color-text-muted) uppercase tracking-[0.06em] mb-3">
          Tags
        </p>
        <div className="flex gap-2 flex-wrap mb-3">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1.25 rounded-full
              bg-(--color-surface) border border-(--color-border) text-[12px] text-(--color-text-secondary)"
            >
              {t}
              <button
                onClick={() => setTags((v) => v.filter((x) => x !== t))}
                className="ml-1 text-(--color-text-muted) bg-transparent border-none cursor-pointer text-[14px]">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag…"
            className="flex-1 px-3 py-2 border border-(--color-border) rounded-full bg-(--color-surface) text-[13px] text-(--color-text) outline-none"
          />
          <Button variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// Single editable block
const Block = forwardRef(
  function Block(
    { block, onChange, onDelete, onAdd, onTypeChange, openSlashMenu, closeSlashMenu, isSlashMenuOpen },
    ref
  ) {

    const cls = {
      text:  'text-[15px] leading-[1.8] text-[var(--color-text)]',
      h1:    'text-[32px] font-bold leading-[1.3] text-[var(--color-text)]',
      h2:    'text-[24px] font-bold leading-[1.35] text-[var(--color-text)]',
      h3:    'text-[18px] font-semibold leading-[1.4] text-[var(--color-text)]',
      quote: 'text-[17px] italic leading-[1.7] text-[var(--color-text-secondary)] border-l-4 border-[var(--color-accent)] pl-4',
      code:  'font-mono text-[13px] leading-[1.7] bg-[var(--color-bg-alt)] px-4 py-2 rounded-[10px] text-[var(--color-text)]',
      image: 'text-[13px] text-[var(--color-text-secondary)]',
    }
 
    // Handle key events for slash menu
   const handleKey = (e) => {
      // Add new block on Enter
      if (e.key === 'Enter' && !e.shiftKey && !isSlashMenuOpen) { 
        console.log('Handle key')
        e.preventDefault();
        onAdd();
      }
      // Delete block on backspace if empty
      if (e.key === 'Backspace' && !block.content) { 
        e.preventDefault();
        onDelete();
      }
      // Open Slash menu
      if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Get caret position for menu
        const textarea = e.target;
        const { selectionStart } = textarea;
        // Calculate position
        const rect = textarea.getBoundingClientRect();
        // Estimate caret position (imperfect, but works for single-line)
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
        const x = rect.left + 24;
        const y = rect.top + (lineHeight * (textarea.value.slice(0, selectionStart).split('\n').length - 1)) + 32 + window.scrollY;
        openSlashMenu(block.id, { x, y }, '');
      }
      // If menu is open, update filter
      if (e.key.length === 1 && block.content.endsWith('/')) {
        // Start filtering after /
        openSlashMenu(block.id, { x: 200, y: 100 }, '');
      }
   }

    // Handle input for filtering
    const handleChange = (val) => {
      onChange(val)
      // If slash menu is open, update filter
      const match = val.match(/\/(\w*)$/)
      if (match) {
        // Get caret position
        const textarea = ref?.current
        let x = 200, y = 100
        if (textarea) {
          const rect = textarea.getBoundingClientRect()
          const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24
          x = rect.left + 24
          y = rect.top + (lineHeight * (textarea.value.slice(0, textarea.selectionStart).split('\n').length - 1)) + 32 + window.scrollY
        }
        openSlashMenu(block.id, { x, y }, match[1])
      } else {
        closeSlashMenu()
      }
    }
 
   if (block.type === 'divider')
     return <div className="h-px bg-(--color-border) my-4 w-full" />

   return (
      <div className="relative group flex items-start gap-2">
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {block.type === 'image' && block.content && (
            <img src={block.content} alt="block" className="w-full rounded-[10px] mb-2 object-cover max-h-100 block" />
          )}
          <textarea
            ref={ref}
            value={block.content}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={{
              text: 'Write something…', h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
              quote: 'A thought worth quoting…', code: '// code here', image: 'Paste image URL…',
            }[block.type]}
            rows={1}
            className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-(--color-text-muted) ${cls[block.type] || cls.text}`}
            style={{ minHeight: '1.6em' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
          />
        </div>
        
        {/* Delete button */}
        <button onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 w-6 h-6 flex items-center justify-center rounded text-(--color-text-muted) hover:text-red-500 bg-transparent border-none cursor-pointer text-[16px] shrink-0">
          ×
        </button>
      </div>
    )
 }
);