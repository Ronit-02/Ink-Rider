// Custom hook for managing editor blocks
import { useState, useRef } from 'react';
import { newBlock, placeCaretAtEnd } from '../utils/blockUtils';

/**
 * Custom hook to manage blocks and related operations
 */
export function useBlocks() {
  const [blocks, setBlocks] = useState(() => {
    const saved = localStorage.getItem('unsaved content');
    return saved ? JSON.parse(saved) : [newBlock()];
  });
  const blockRefs = useRef({});

  // Update block content
  const updateBlock = (id, val) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, content: val } : bl));
  };

  // Delete a block and focus previous or next
  const deleteBlock = (id) => {
    let focusBlkId = null;
    if (blocks.length === 1) {
      const newBlk = newBlock();
      setBlocks([newBlk]);
      focusBlkId = newBlk.id;
    } else {
      const idx = blocks.findIndex(bl => bl.id === id);
      focusBlkId = idx > 0 ? blocks[idx - 1].id : blocks[1].id;
      setBlocks(b => b.length > 1 ? b.filter(bl => bl.id !== id) : b);
    }
    setTimeout(() => {
      placeCaretAtEnd(blockRefs.current[focusBlkId]);
    }, 0);
  };

  // Add a block after the given block, optionally with initial content
  const addAfter = (id, initialContent = '') => {
    const newBlk = newBlock();
    if (initialContent) newBlk.content = initialContent;
    setBlocks(b => {
      const i = b.findIndex(bl => bl.id === id);
      if (i === -1) return b;
      const nb = [...b];
      nb.splice(i + 1, 0, newBlk);
      return nb;
    });
    setTimeout(() => {
      blockRefs.current[newBlk.id]?.focus();
      if (initialContent) {
        const el = blockRefs.current[newBlk.id];
        if (el && el.setSelectionRange) el.setSelectionRange(0, 0);
      }
    }, 0);
  };

  // Change block type
  const changeType = (id, type) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, type } : bl));
  };

  // Add divider block
  const addDivider = () => {
    setBlocks(b => [...b, newBlock('divider'), newBlock()]);
  };

  // Move focus to next/prev block
  const moveFocus = (id, dir) => {
    const i = blocks.findIndex(b => b.id === id);
    const nextIdx = i + dir;
    if (nextIdx >= 0 && nextIdx < blocks.length) {
      const nextId = blocks[nextIdx].id;
      setTimeout(() => {
        blockRefs.current[nextId]?.focus();
      }, 0);
    }
  };

  // Merge current block to previous
  const mergeToPrevBlock = (id, content) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === 0) return;
    const blk = blocks[idx];
    const prevBlk = blocks[idx - 1];
    if (blk.type === 'image' || prevBlk.type === 'image') return;
    setBlocks(prev =>
      prev
        .map((b, i) => (i === idx - 1) ? { ...b, content: b.content + content } : b)
        .filter(b => b.id !== blk.id)
    );
    setTimeout(() => {
      const textarea = blockRefs.current[prevBlk.id];
      const cursorPos = prevBlk.content.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  // Paste clipboard content into blocks
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
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content: contentArray[0] };
        const newBlocks = contentArray.slice(1).map(c => ({
          id: newBlock().id,
          type: 'text',
          content: c,
        }));
        updated.splice(idx + 1, 0, ...newBlocks);
        return updated;
      });
    } catch (err) {
      console.error('Failed to read clipboard - ', err);
    }
  };

  return {
    blocks,
    setBlocks,
    blockRefs,
    updateBlock,
    deleteBlock,
    addAfter,
    changeType,
    addDivider,
    moveFocus,
    mergeToPrevBlock,
    copyPasteContent,
  };
}
