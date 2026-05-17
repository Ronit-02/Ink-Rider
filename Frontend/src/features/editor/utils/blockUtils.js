// Utility functions for block operations
import { v4 as uuid } from 'uuid';

/**
 * Create a new block object
 * @param {string} type - Block type
 * @returns {object}
 */
export function newBlock(type = 'text') {
  return {
    id: uuid(),
    type,
    content: '',
  };
}

/**
 * Place caret at the end of a given element (textarea or contenteditable)
 * @param {HTMLElement} el
 */
export function placeCaretAtEnd(el) {
  if (!el) return;
  requestAnimationFrame(() => {
    if (el.setSelectionRange && typeof el.value === 'string') {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    } else {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}
