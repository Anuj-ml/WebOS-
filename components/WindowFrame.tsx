import React, { useRef, useEffect, useState } from 'react';
import { X, Minus, Square, Move } from 'lucide-react';
import { WindowState } from '../types';
import { useOS } from '../context/OSContext';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximizeWindow, updateWindowPosition, updateWindowSize } = useOS();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const isActive = useOS().activeWindowId === win.id;

  // --- Dragging Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.stopPropagation();
    focusWindow(win.id);
    // Only drag if clicking the header (handled by specialized handler, but this captures general focus)
  };

  const handleHeaderDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y
    });
  };

  // --- Resizing Logic ---
  const handleResizeDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: win.width,
      h: win.height
    });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        updateWindowPosition(win.id, newX, newY);
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        updateWindowSize(win.id, Math.max(300, resizeStart.w + deltaX), Math.max(200, resizeStart.h + deltaY));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, win.id, updateWindowPosition, updateWindowSize]);


  if (win.isMinimized) return null;

  const frameStyle: React.CSSProperties = win.isMaximized 
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', transform: 'none' }
    : { top: win.y, left: win.x, width: win.width, height: win.height };

  return (
    <div 
      className={`absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border 
                  ${isActive ? 'border-blue-400 z-50' : 'border-gray-600/30'}
                  transition-shadow duration-200`}
      style={{ 
        ...frameStyle, 
        zIndex: win.zIndex,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header / Titlebar */}
      <div 
        className={`h-9 flex items-center justify-between px-3 select-none
                   ${isActive ? 'bg-gray-200/80 text-gray-800' : 'bg-gray-100/80 text-gray-500'}
                   border-b border-gray-300/50`}
        onDoubleClick={() => toggleMaximizeWindow(win.id)}
        onMouseDown={handleHeaderDown}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Icon could go here */}
          <span className="text-xs font-medium truncate">{win.title}</span>
        </div>
        
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={() => minimizeWindow(win.id)} 
            className="p-1 hover:bg-gray-300 rounded transition-colors"
          >
            <Minus size={12} />
          </button>
          <button 
            onClick={() => toggleMaximizeWindow(win.id)} 
            className="p-1 hover:bg-gray-300 rounded transition-colors"
          >
            <Square size={10} />
          </button>
          <button 
            onClick={() => closeWindow(win.id)} 
            className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-white/50">
        {children}
      </div>

      {/* Resize Handle */}
      {!win.isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center z-50"
          onMouseDown={handleResizeDown}
        >
           <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-gray-400/50" />
        </div>
      )}
    </div>
  );
};