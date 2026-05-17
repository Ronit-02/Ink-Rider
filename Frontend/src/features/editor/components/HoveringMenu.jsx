import React from 'react';

/**
 * Floating formatting menu for text selection
 */
const HoveringMenu = ({ position, onFormat }) => {
  if (!position) return null;
  return (
    <div
      className="absolute bg-white shadow-md rounded-md p-2 flex gap-2 z-50"
      style={{ top: position.y, left: position.x }}
    >
      <button onMouseDown={e => e.preventDefault()} onClick={() => onFormat('bold')} className="hover:bg-gray-200 p-1 rounded font-bold">B</button>
      <button onMouseDown={e => e.preventDefault()} onClick={() => onFormat('italic')} className="hover:bg-gray-200 p-1 rounded italic">I</button>
      <button onMouseDown={e => e.preventDefault()} onClick={() => onFormat('underline')} className="hover:bg-gray-200 p-1 rounded underline">U</button>
      <button onMouseDown={e => e.preventDefault()} onClick={() => onFormat('link')} className="hover:bg-gray-200 p-1 rounded">🔗</button>
    </div>
  );
};

export default HoveringMenu;
