import { useState, useRef, forwardRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import Button from '@/shared/components/ui/Button'
import SlashMenu from '../components/SlashMenu'
import createPost from '../api/createPost'
import fetchDepthOptions from '../api/fetchDepthOptions'
import useEntitlements from '@/features/membership/hooks/useEntitlements'
import { createDraft, deleteDraft, fetchDraft, updateDraft } from '../api/drafts'
import { updatePost } from '../api/updatePost'
import fetchPost from '@/features/post/api/fetchPost'
import useToast from '@/shared/hooks/useToast'
import { useSelector } from 'react-redux'
import PageFrame from '@/shared/components/layout/PageFrame'
import SignInPrompt from '@/shared/components/ui/SignInPrompt'

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
  const isReady = useSelector(state => state.auth.isReady)
  const user = useSelector(state => state.auth.user)
  if (!isReady) return <PageFrame><p role="status">Restoring your session…</p></PageFrame>
  if (!user) return <PageFrame className="flex min-h-full flex-col !pb-6"><SignInPrompt message="Sign in to start writing." /></PageFrame>
  return <MemberEditor />
}

function MemberEditor() {

  // State and refs
  const navigate  = useNavigate()
  const { notify } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const sourceQuestionId = searchParams.get('question')
  const initialDraftId = searchParams.get('draft')
  const editPostId = searchParams.get('edit')
  const [title,   setTitle]   = useState('')
  const [format, setFormat] = useState('article')
  const [depthParentId, setDepthParentId] = useState('')
  const [publicAt, setPublicAt] = useState('')
  const [blocks, setBlocks] = useState(() => [newBlock()])
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
  const [detailsOpen, setDetailsOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const [draftId, setDraftId] = useState(initialDraftId)
  const [draftVersion, setDraftVersion] = useState(null)
  const [postRevision, setPostRevision] = useState(null)
  const [autosaveStatus, setAutosaveStatus] = useState(initialDraftId ? 'loading' : 'idle')
  const [scheduleBounds] = useState(() => {
    const now = new Date()
    return {
      min: now.toISOString().slice(0, 16),
      max: new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 16),
    }
  })
  const fileRef   = useRef()
  const blockRefs  = useRef({})
  const slashAnchorRef = useRef(null)
  const editorRef = useRef()
  const hydratedDraftRef = useRef(!initialDraftId && !editPostId)
  const draftIdRef = useRef(initialDraftId)
  const draftVersionRef = useRef(null)
  const wordCount = blocks.reduce((count, block) => count + String(block.content || '').trim().split(/\s+/).filter(Boolean).length, 0)
  const depthOptions = useQuery({ queryKey: ['depth-options'], queryFn: fetchDepthOptions, enabled: format === 'short' })
  const entitlements = useEntitlements(true)
  const canScheduleEarlyAccess = entitlements.data?.capabilities?.includes('early_access')
  const draftQuery = useQuery({ queryKey: ['draft', initialDraftId], queryFn: () => fetchDraft(initialDraftId), enabled: Boolean(initialDraftId), retry: false })
  const editQuery = useQuery({ queryKey: ['post', editPostId], queryFn: fetchPost, enabled: Boolean(editPostId), retry: false })

  useEffect(() => {
    if (!draftQuery.data || hydratedDraftRef.current) return
    const draft = draftQuery.data
    setTitle(draft.title || '')
    setFormat(draft.format || 'article')
    setBlocks(draft.blocks?.length ? draft.blocks : [newBlock()])
    setTags(draft.tags || [])
    setPublicAt(draft.publicAt ? new Date(draft.publicAt).toISOString().slice(0, 16) : '')
    setDraftVersion(draft.version)
    draftVersionRef.current = draft.version
    hydratedDraftRef.current = true
    setAutosaveStatus('saved')
  }, [draftQuery.data])

  useEffect(() => {
    if (!editQuery.data || initialDraftId || hydratedDraftRef.current) return
    const post = editQuery.data
    let parsedBlocks
    try { parsedBlocks = JSON.parse(post.body) } catch { parsedBlocks = [newBlock()] }
    setTitle(post.title || '')
    setFormat(post.format || 'article')
    setBlocks(parsedBlocks)
    setTags(post.tags || [])
    setCover(post.coverImage || null)
    setPostRevision(post.currentRevision || 1)
    setPublicAt(post.publicAt ? new Date(post.publicAt).toISOString().slice(0, 16) : '')
    hydratedDraftRef.current = true
    setAutosaveStatus('idle')
  }, [editQuery.data, initialDraftId])

  useEffect(() => {
    draftIdRef.current = draftId
    draftVersionRef.current = draftVersion
  }, [draftId, draftVersion])

  useEffect(() => {
    if (!hydratedDraftRef.current || draftQuery.isError) return
    setAutosaveStatus('waiting')
    const timer = window.setTimeout(async () => {
      const payload = { title, format, blocks, tags, publicAt: publicAt ? new Date(publicAt).toISOString() : null }
      try {
        setAutosaveStatus('saving')
        const result = draftIdRef.current
          ? await updateDraft({ draftId: draftIdRef.current, expectedVersion: draftVersionRef.current, ...payload })
          : await createDraft(payload)
        if (!draftIdRef.current) {
          draftIdRef.current = result.id
          setDraftId(result.id)
          const next = new URLSearchParams(searchParams)
          next.set('draft', result.id)
          setSearchParams(next, { replace: true })
        }
        draftVersionRef.current = result.version
        setDraftVersion(result.version)
        setAutosaveStatus('saved')
      } catch (saveError) {
        setAutosaveStatus(saveError?.response?.status === 409 ? 'conflict' : 'error')
      }
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [title, format, blocks, tags, publicAt, draftQuery.isError, searchParams, setSearchParams])

  // Creating Post
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: input => editPostId ? updatePost(input) : createPost(input),
    onSuccess: (response) => {
      if (draftIdRef.current) deleteDraft(draftIdRef.current).catch(() => {})
      notify(editPostId ? 'Post updated.' : 'Post published.')
      navigate(`/post/${editPostId || response.postId}`);
      // displayNotification(response.message);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'An error occurred while creating the post.';
      notify(message, { tone: 'error' })
      // displayNotification(message, 'error');
    },
  });
  
  // Submitting Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editPostId) {
      mutate({ postId: editPostId, expectedRevision: postRevision, title, body: JSON.stringify(blocks), tags, publicAt: publicAt ? new Date(publicAt).toISOString() : undefined })
      return
    }
    const formData = new FormData();
    formData.append('coverURL', coverURL);
    formData.append('title', title);
    formData.append('body', JSON.stringify(blocks));
    formData.append('tags', tags);
    formData.append('format', format);
    if (format === 'short' && depthParentId) formData.append('depthParentId', depthParentId);
    if (sourceQuestionId) formData.append('questionId', sourceQuestionId);
    if (publicAt) formData.append('publicAt', new Date(publicAt).toISOString());
    mutate(formData);
  };
  
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
  const updateBlockField = (id, field, val) => {
    setBlocks(current => current.map(block => block.id === id ? { ...block, [field]: val } : block))
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
  // Slash menu handlers
  const openSlashMenu = (blockId, filter = '') => {
    const blockEl = blockRefs.current[blockId];
    const editorEl = editorRef.current;

    if (!blockEl || !editorEl) return;
    slashAnchorRef.current = blockEl;

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
    if (idx === 0) return;

    const blk = blocks[idx];
    const prevBlk = blocks[idx - 1];
    
    if (blk.type === 'image' || prevBlk.type === 'image') return;
    
    setBlocks(prev => 
      prev
       .map((b, i) => (i === idx - 1) ? {...b, content: b.content + content} : b)
       .filter(b => b.id !== blk.id)
    );
    
    setTimeout(() => {
      const textarea = blockRefs.current[prevBlk.id];
      const cursorPos = prevBlk.content.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0)
  }

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

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8">

      {/* <HoveringMenu position={menuPosition} onFormat={applyFormatting} /> */}
      
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>{editPostId ? 'Edit story' : 'Write'}</h1>
          <p role="status" aria-live="polite" className={`mt-1 text-[12px] ${['conflict', 'error'].includes(autosaveStatus) ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
            {autosaveStatus === 'loading' ? 'Loading draft…' : autosaveStatus === 'saving' ? 'Saving…' : autosaveStatus === 'conflict' ? 'Draft conflict' : autosaveStatus === 'error' ? 'Save failed' : autosaveStatus === 'saved' ? '✓ Saved' : autosaveStatus === 'waiting' ? 'Unsaved changes' : 'Autosave on'}
          </p>
        </div>
          <Button
            variant="primary"
            className="!min-h-11"
            disabled={!title.trim() || !tags.length || (format === 'article' && !coverURL && !cover) || (format === 'short' && wordCount > 500) || isPending}
            onClick={handleSubmit} aria-busy={isPending}>
            {editPostId ? 'Update' : 'Publish'}
          </Button>
      </header>

      {sourceQuestionId && <div className="mb-6 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3 text-[12px] text-[var(--color-text-secondary)]">This article will be published as a response to a reader question.</div>}
      {draftQuery.isError && <p role="alert" className="mb-6 rounded-[12px] border border-[var(--color-danger)] px-4 py-3 text-[12px] text-[var(--color-danger)]">This draft could not be loaded. Return to your profile and choose it again.</p>}
      {autosaveStatus === 'conflict' && <p role="alert" className="mb-6 rounded-[12px] border border-[var(--color-danger)] px-4 py-3 text-[12px] text-[var(--color-danger)]">This draft changed in another tab. Reload before making more edits so you do not overwrite newer work.</p>}

      {isError && <p role="alert" className="mb-5 text-[12px] text-[var(--color-danger)]">{error?.response?.data?.message || 'The post could not be published.'}</p>}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <section aria-label="Writing area" className="min-w-0">
          <div className="mb-8 flex max-w-[400px] items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-2">
            {[{ id: 'article', label: 'Long-form article' }, { id: 'short', label: 'Short read' }].map(option => <button key={option.id} type="button" onClick={() => setFormat(option.id)} aria-pressed={format === option.id} className={`min-h-11 flex-1 rounded-[10px] px-3 py-2 text-[12px] font-semibold ${format === option.id ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}>{option.label}</button>)}
          </div>

          {/* ── Title input ── */}
          <label htmlFor="editor-title" className="mb-3 block text-[12px] font-medium text-[var(--color-text-secondary)]">{format === 'short' ? 'Short title' : 'Article title'}</label>
          <textarea
            id="editor-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={format === 'short' ? 'A focused idea…' : 'Title…'}
            maxLength={format === 'short' ? 120 : 180}
            className="editor-writing-field w-full bg-transparent border-none outline-none resize-none font-bold text-[clamp(24px,4vw,36px)] leading-[1.3] tracking-[-0.5px] mb-8 text-(--color-text) placeholder:text-(--color-text-muted)"
            style={{ fontFamily: "var(--font-display)", minHeight: "1.3em" }}
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />

          {/* ── Block editor ── */}
          <p className="mb-3 text-[12px] font-medium text-[var(--color-text-secondary)]">Story</p>
          <div className="flex min-h-[240px] flex-col gap-2 mb-4 relative" ref={editorRef}>
            {blocks.map(bl => (
              <Block
                key={bl.id}
                block={bl}
                ref={(el) => blockRefs.current[bl.id] = el}
                onChange={(v) => updateBlock(bl.id, v)}
                onAltChange={(value) => updateBlockField(bl.id, 'alt', value)}
                onDelete={() => deleteBlock(bl.id)}
                onAdd={(content) => addAfter(bl.id, content)}
                onTypeChange={(t) => changeType(bl.id, t)}
                openSlashMenu={openSlashMenu}
                closeSlashMenu={closeSlashMenu}
                isSlashMenuOpen={slashMenu.open && slashMenu.blockId === bl.id}
                moveFocus={moveFocus}
                mergeToPrevBlock={mergeToPrevBlock}
                copyPasteContent={copyPasteContent}
              />
            ))}

            {slashMenu.open && (
              <SlashMenu anchorRef={slashAnchorRef}
                options={BLOCK_TYPES.filter(b => b.type !== 'divider' || blocks.length > 1)}
                position={slashMenu.position}
                filter={slashMenu.filter}
                onSelect={handleSlashSelect}
                onClose={closeSlashMenu}
              />
            )}

          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--color-text-secondary)]">
            <p>Type / in a block for formatting options.</p>
            <p className={format === 'short' && wordCount > 500 ? 'text-[var(--color-danger)]' : ''}>{format === 'short' ? `${wordCount}/500 words` : `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}</p>
          </div>

        </section>
        <aside aria-label="Publishing details" className="min-w-0 lg:sticky lg:top-6">
          <details open={detailsOpen} onToggle={event => setDetailsOpen(event.currentTarget.open)} className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
            <summary className="cursor-pointer px-4 py-4 text-[14px] font-semibold text-[var(--color-text)]">
              Story details
              <span className="mt-1 block text-[12px] font-normal text-[var(--color-text-secondary)]">Cover, tags &amp; publishing options</span>
            </summary>
            <div className="border-t border-[var(--color-border)] p-4">
              {/* ── Cover image ── */}
              <div className="mb-6">
                <h2 className="mb-3 text-[13px] font-semibold text-[var(--color-text)]">Cover image <span className="font-normal text-[var(--color-text-secondary)]">{format === 'short' ? '(optional)' : '(required)'}</span></h2>
                {cover ? (
                  <div className="relative">
                    <img src={cover} alt="cover" className="w-full h-40 object-cover rounded-[14px] block"/>
                    <button
                      type="button"
                      aria-label="Remove cover image"
                      onClick={() => { setCover(null); setCoverURL(''); if (fileRef.current) fileRef.current.value = '' }}
                      className="absolute top-2 right-2 w-11 h-11 rounded-full bg-black/60 text-white border-none cursor-pointer flex items-center justify-center text-[18px]">
                      ×
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full min-h-11 px-3 py-3 rounded-[14px] border-2 border-dashed border-(--color-border) flex items-center justify-center text-(--color-text-muted) text-[13px] font-medium cursor-pointer bg-transparent hover:bg-(--color-bg-alt) transition-colors">
                    {format === 'short' ? '+ Add optional cover image' : '+ Add cover image'}
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

              {/* ── Tags ── */}
              <div className="mb-6">
                <h2 className="mb-3 text-[13px] font-semibold text-[var(--color-text)]">Tags <span className="font-normal text-[var(--color-text-secondary)]">(at least one)</span></h2>
                <div className="flex gap-2 flex-wrap mb-3">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex max-w-full items-center gap-1 break-all px-2.5 py-1.25 rounded-full
                      bg-(--color-surface) border border-(--color-border) text-[12px] text-(--color-text-secondary)"
                    >
                      {t}
                      <button
                        type="button"
                        aria-label={`Remove ${t} tag`}
                        onClick={() => setTags((v) => v.filter((x) => x !== t))}
                        className="ml-1 text-(--color-text-muted) bg-transparent border-none cursor-pointer text-[14px]">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <label htmlFor="editor-tag-input" className="sr-only">Add a tag</label>
                  <input
                    id="editor-tag-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag…"
                    className="min-w-0 min-h-11 flex-1 px-3 py-2 border border-(--color-border) rounded-full bg-(--color-surface) text-[13px] text-(--color-text) outline-none"
                  />
                  <Button variant="secondary" className="!min-h-11" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </div>

              {format === 'short' && <div className="mb-7"><label htmlFor="depth-parent" className="block mb-2 text-[12px] font-semibold text-[var(--color-text)]">Deeper article <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label><select id="depth-parent" value={depthParentId} onChange={event => setDepthParentId(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]"><option value="">This short stands alone</option>{depthOptions.data?.map(post => <option key={post.id} value={post.id}>{post.title}</option>)}</select><p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Readers will be able to move between this quick explanation and the full article.</p></div>}
              {canScheduleEarlyAccess && <div className="mb-7"><label htmlFor="public-at" className="block mb-2 text-[12px] font-semibold text-[var(--color-text)]">Public release <span className="font-normal text-[var(--color-text-muted)]">(optional)</span></label><input id="public-at" type="datetime-local" value={publicAt} min={scheduleBounds.min} max={scheduleBounds.max} onChange={event => setPublicAt(event.target.value)} className="w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-3 text-[13px] text-[var(--color-text)]" /><p className="mt-2 text-[11px] text-[var(--color-text-muted)]">Members can read immediately; everyone else gets access at this time.</p></div>}
            </div>
          </details>
          <p className="mt-3 text-[12px] leading-5 text-[var(--color-text-secondary)]">{format === 'article' ? 'To publish, add a title, at least one tag, and a cover image.' : 'To publish, add a title and at least one tag. Keep your short within 500 words.'}</p>
        </aside>
      </div>

    </main>
  );
}

// Single editable block
const Block = forwardRef(
  function Block(
    { block, onChange, onAltChange, onDelete, onAdd, openSlashMenu, closeSlashMenu, isSlashMenuOpen, moveFocus, mergeToPrevBlock, copyPasteContent },
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
              aria-label={`${block.type === 'text' ? 'Paragraph' : block.type} block`}
              aria-controls={isSlashMenuOpen ? 'editor-slash-menu' : undefined}
              value={block.content}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={handleKey}
              placeholder={{
                text: 'Write something…', h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
                quote: 'A thought worth quoting…', code: '// code here', image: 'Paste image URL…',
              }[block.type]}
              rows={1}
              className={`editor-writing-field w-full outline-none resize-none overflow-hidden placeholder:text-(--color-text-muted) ${cls[block.type] || cls.text}`}
              style={{ minHeight: '1.6em' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
            />
            {block.type === 'image' && <input value={block.alt || ''} maxLength={300} onChange={event => onAltChange(event.target.value)} placeholder="Describe this image for screen readers" aria-label="Image description" className="mt-2 w-full rounded-[8px] border border-(--color-border) bg-(--color-bg-alt) px-3 py-2 text-[12px] text-(--color-text)" />}
          </div>
        }
        
        {/* Add block button (appears on hover) */}
        <button
          type="button"
          aria-label="Add block after this block"
          onClick={() => onAdd()}
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity mt-1 w-10 h-10 flex items-center justify-center rounded text-(--color-text-muted) hover:text-green-500 bg-transparent border-none cursor-pointer text-[18px] shrink-0"
          title="Add block after"
          tabIndex={0}
        >
          +
        </button>

        {/* Delete button */}
        <button type="button" aria-label={`Delete ${block.type} block`} onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity mt-1 w-10 h-10 flex items-center justify-center rounded text-(--color-text-muted) hover:text-red-500 bg-transparent border-none cursor-pointer text-[16px] shrink-0">
          ×
        </button>
      </div>
    )
  }
);

