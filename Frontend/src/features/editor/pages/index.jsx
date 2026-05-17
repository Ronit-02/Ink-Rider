import { useState, useRef, forwardRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import Button from '@/shared/components/ui/Button'
import SlashMenu from '../components/SlashMenu'
import createPost from '../api/createPost'

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
  const [blocks, setBlocks] = useState(() => {
    const saved = localStorage.getItem("unsaved content")
    return saved ? JSON.parse(saved) : [newBlock()]
  })
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
  const [menuPosition, setMenuPosition] = useState(null);
  const fileRef   = useRef()
  const blockRefs  = useRef({})
  const editorRef = useRef()

  // Creating Post
  const { mutate, isLoading } = useMutation({
    mutationFn: createPost,
    onSuccess: (response) => {
      localStorage.removeItem("unsaved content");
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
    let focusBlkId = null;
    
    // If last, Prevent deleting the last block
    if(blocks.length === 1) {
      const newBlk = newBlock();
      setBlocks([newBlk]);
      focusBlkId = newBlk.id
    }
    // Otherwise, Delete current block
    else{
      const idx = blocks.findIndex(bl => bl.id === id);
      focusBlkId = idx > 0 ? blocks[idx - 1].id : blocks[1].id;
      setBlocks(b => b.length > 1 ? b.filter(bl => bl.id !== id) : b)
    }

    // Focus on the new block after deletion
    setTimeout(() => {
      placeCaretAtEnd(blockRefs.current[focusBlkId]);
    }, 0);
  }
  // Add a block after the given block, optionally with initial content
  const addAfter = (id, initialContent = '') => {
    const newBlk = newBlock();
    if (initialContent) newBlk.content = initialContent;

    setBlocks(b => {
      const i = b.findIndex(bl => bl.id === id); 
      if(i === -1) return b;
      const nb = [...b];
      nb.splice(i + 1, 0, newBlk);
      return nb;
    });

    setTimeout(() => {
      blockRefs.current[newBlk.id]?.focus();
      if (initialContent) {
        // Move cursor to start if content was split
        const el = blockRefs.current[newBlk.id];
        if (el && el.setSelectionRange) el.setSelectionRange(0, 0);
      }
    }, 0);
  }
  const changeType = (id, type) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, type } : bl))
  }
  const addDivider = () => {
    setBlocks(b => [...b, newBlock('divider'), newBlock()])
  }

  // Slash menu handlers
  const openSlashMenu = (blockId, filter = '') => {
    const blockEl = blockRefs.current[blockId];
    const editorEl = editorRef.current;

    if (!blockEl || !editorEl) return;

    const blockRect = blockEl.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();

    const MENU_HEIGHT = 200;

    // Position relative to editor
    let y = blockRect.bottom - editorRect.top + 10

    // Detect viewport overflow
    const wouldOverflow = blockRect.bottom + MENU_HEIGHT > window.innerHeight;

    // Open upward if needed
    if (wouldOverflow)
      y = blockRect.top - editorRect.top - MENU_HEIGHT - 10;

    setSlashMenu({ open: true, blockId, position: { x: 0, y }, filter })
  }
  const closeSlashMenu = () => {
    setSlashMenu({ open: false, blockId: null, position: { x: 0, y: 0 }, filter: '' })
  }
  const handleSlashSelect = (item) => {
    if (slashMenu.blockId && item) {
      changeType(slashMenu.blockId, item.type)
      // Optionally clear the "/" and filter from content
      setBlocks(b => b.map(bl => bl.id === slashMenu.blockId ? { ...bl, content: bl.content.replace(/^\/.*/, '') } : bl))
    }
    closeSlashMenu()
    // Refocus block
    setTimeout(() => {
      blockRefs.current[slashMenu.blockId]?.focus();
    }, 0)
  }

  const moveFocus = (id, dir) => {
    const i = blocks.findIndex(b => b.id === id);
    const nextIdx = i + dir;
    if (nextIdx >= 0 && nextIdx < blocks.length) {
      const nextId = blocks[nextIdx].id;
      setTimeout(() => {
        blockRefs.current[nextId]?.focus();
      }, 0);
    }
  }

  const mergeToPrevBlock = (id, content) => {
    const idx = blocks.findIndex(b => b.id === id);
    if(idx == 0) return;

    const blk = blocks[idx];
    const prevBlk = blocks[idx - 1];
    
    if(blk.type == 'image' || prevBlk.type == 'image') return;
    
    setBlocks(prev => 
      prev
      .map((b, i) => (i == idx - 1) ? {...b, content: b.content + content} : b)
      .filter(b => b.id != blk.id)
    );
    
    setTimeout(() => {
      const textarea = blockRefs.current[prevBlk.id];
      const cursorPos = prevBlk.content.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0)
  }

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setMenuPosition(null);
      return;
    }

    const selectedText = selection.toString().trim();
    console.log('Selected text - ', selectedText)
    if (!selectedText) {
      setMenuPosition(null);
      return;
    }

    const editor = editorRef.current;
    if(!editor) return;

    const isInsideEditor = editor.contains(selection.anchorNode) && editor.contains(selection.focusNode);
    if(!isInsideEditor){
      setMenuPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setMenuPosition({ 
      x: rect.left + rect.width / 2 + window.scrollX, 
      y: rect.top + window.scrollY - 40 
    });
  };

  const applyFormatting = (format) => {
    const selection = window.getSelection();
    if(!selection || selection.rangeCount === 0) return;

    if (format === 'link') {
      const url = window.prompt('Enter URL');
      if (url) {
        // document.execCommand('createLink', false, url);
      }
    } else {
      // document.execCommand(format, false, null);
    }
    setMenuPosition(null);
  };

  const placeCaretAtEnd = (el) => {
    if (!el) return;
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      // For textarea or input
      if (el.setSelectionRange && typeof el.value === 'string') {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      } else {
        // For contenteditable
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  };

  // Copy content into blocks
  const copyPasteContent = async (id) => {
    try {
      const content = await navigator.clipboard.readText();
      const contentArray = content
        .split('\n')
        .map(line => line.replace(/\n/g, '').trimEnd())
        .filter(line => line !== '');
      if (contentArray.length === 0) return;

      setBlocks(prev => {
        const idx = prev.findIndex(bl => bl.id === id);
        if (idx === -1) return prev;
        // Replace current block with first line, insert rest after
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content: contentArray[0] };
        const newBlocks = contentArray.slice(1).map(c => ({
          id: uuid(),
          type: "text",
          content: c
        }));
        updated.splice(idx + 1, 0, ...newBlocks);
        return updated;
      });
    } catch (err) {
      console.error("Failed to read clipboard - ", err);
    }
  }

  // useEffect(() => {
  //   document.addEventListener('mouseup', handleTextSelection);
  //   document.addEventListener('keyup', handleTextSelection);
  //   return () => {
  //     document.removeEventListener('mouseup', handleTextSelection);
  //     document.removeEventListener('keyup', handleTextSelection);
  //   };
  // }, []);

  useEffect(() => {
    localStorage.setItem(
      "unsaved content",
      JSON.stringify(blocks)
    )
  }, [blocks])

  return (
    <div className="max-w-185 px-8 pt-10 pb-20">

      {/* <HoveringMenu position={menuPosition} onFormat={applyFormatting} /> */}
      
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
      <div className="flex flex-col gap-2 mb-8 relative" ref={editorRef}>
        {blocks.map((bl, idx) => (
          <Block
            key={bl.id}
            block={bl}
            ref={(el) => blockRefs.current[bl.id] = el}
            onChange={(v) => updateBlock(bl.id, v)}
            onDelete={() => deleteBlock(bl.id)}
            onAdd={(content) => addAfter(bl.id, content)}
            onTypeChange={(t) => changeType(bl.id, t)}
            openSlashMenu={openSlashMenu}
            closeSlashMenu={closeSlashMenu}
            isSlashMenuOpen={slashMenu.open}
            moveFocus={moveFocus}
            mergeToPrevBlock={mergeToPrevBlock}
            copyPasteContent={copyPasteContent}
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
    { block, onChange, onDelete, onAdd, onTypeChange, openSlashMenu, closeSlashMenu, isSlashMenuOpen, moveFocus, mergeToPrevBlock, copyPasteContent },
    ref
  ) {

    const cls = {
      text:  'text-[15px] bg-transparent border-none leading-[1.8] text-[var(--color-text)]',
      h1:    'text-[32px] bg-transparent border-none font-bold leading-[1.3] text-[var(--color-text)]',
      h2:    'text-[24px] bg-transparent border-none font-bold leading-[1.35] text-[var(--color-text)]',
      h3:    'text-[18px] bg-transparent border-none font-semibold leading-[1.4] text-[var(--color-text)]',
      quote: 'text-[17px] bg-transparent italic leading-[1.7] border-l-4 text-[var(--color-text-secondary)] border-[#111] pl-4',
      code:  'font-mono bg-[#f4f4f4] border-none text-[13px] leading-[1.7] p-4 rounded-[10px] rounded-lg',
      image: 'text-[13px] bg-transparent border-none text-[var(--color-text-secondary)]',
    }

    // Handle key events for slash menu and navigation
    const handleKey = (e) => {

      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const linesBeforeCursor = textarea.value.substring(0, cursorPos).split("\n");
      const currentLine = linesBeforeCursor.length;
      
      // Arrow up navigation
      if (e.key === "ArrowUp") {
        // only move blocks if already at first line
        if (currentLine === 1) {
          e.preventDefault();
          moveFocus(block.id, -1);
        }
        return;
      }
      // Arrow down navigation
      if (e.key === "ArrowDown") {
        const totalLines = textarea.value.split("\n").length;
        // only move blocks if already at last line
        if (currentLine === totalLines) {
          e.preventDefault();
          moveFocus(block.id, 1);
        }
        return;
      }
      // Pasting content into editor into separate blocks
      if (e.key === 'v' && e.ctrlKey) {
        e.preventDefault();
        copyPasteContent(block.id);
      }
      // Add new block on Enter (split block if content after cursor)
      if (e.key === 'Enter' && !e.shiftKey && !isSlashMenuOpen) {
        e.preventDefault();
        const value = textarea.value;
        const before = value.slice(0, cursorPos);
        const after = value.slice(cursorPos);
        onChange(before);
        onAdd(after);
      }
      // Merge with previous block on Backspace at start
      if (e.key === 'Backspace' && e.target.selectionStart === 0 && e.target.selectionEnd === 0 && block.content.length > 0) {
        e.preventDefault();
        mergeToPrevBlock(block.id, block.content);
      }
      // Delete block on backspace if empty
      if (e.key === 'Backspace' && !block.content) {
        e.preventDefault();
        onDelete();
      }
      // Open Slash menu
      if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        openSlashMenu(block.id, '');
      }
      // If menu is open, update filter
      if (e.key.length === 1 && block.content.endsWith('/')) {
        openSlashMenu(block.id, '');
      }
    }

    // Handle input for filtering
    const handleChange = (val) => {
      onChange(val)
      // If slash menu is open, update filter
      const match = val.match(/\/(\w*)$/)
      if (match) {
        openSlashMenu(block.id, match[1])
      } else {
        closeSlashMenu()
      }
    }

    return (
      <div className="relative group flex items-start gap-2">
        {/* Add block button (appears on hover) */}
        <button
          onClick={() => onAdd()}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 w-6 h-6 flex items-center justify-center rounded text-(--color-text-muted) hover:text-green-500 bg-transparent border-none cursor-pointer text-[18px] shrink-0"
          title="Add block after"
          tabIndex={-1}
        >
          +
        </button>

        {/* Content */}
        {
          block.type === "divider"
        ? 
          <div className="h-px bg-(--color-border) my-4 w-full" />
        :
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
              className={`w-full outline-none resize-none overflow-hidden placeholder:text-(--color-text-muted) ${cls[block.type] || cls.text}`}
              style={{ minHeight: '1.6em' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
            />
          </div>
        }
        
        {/* Delete button */}
        <button onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 w-6 h-6 flex items-center justify-center rounded text-(--color-text-muted) hover:text-red-500 bg-transparent border-none cursor-pointer text-[16px] shrink-0">
          ×
        </button>
      </div>
    )
  }
);

const HoveringMenu = ({ position, onFormat }) => {
  if (!position) return null;

  return (
    <div
      className="absolute bg-white shadow-md rounded-md p-2 flex gap-2 z-50"
      style={{ top: position.y, left: position.x }}
    >
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('bold')} className="hover:bg-gray-200 p-1 rounded font-bold">B</button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('italic')} className="hover:bg-gray-200 p-1 rounded italic">I</button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('underline')} className="hover:bg-gray-200 p-1 rounded underline">U</button>
      <button onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('link')} className="hover:bg-gray-200 p-1 rounded">🔗</button>
    </div>
  );
}