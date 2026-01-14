import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Trash2, Copy, Clipboard, AlignLeft, AlignCenter, AlignRight, 
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  MoveUp, MoveDown, Layers
} from 'lucide-react';

export default function InteractiveCanvas({ config, updateConfig }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const canvasRef = useRef(null);

  const layoutElements = config.layout?.elements || [];
  const snapEnabled = config.layout?.snapEnabled || false;
  const snapGrid = config.layout?.snapGrid || 10;

  const snapToGrid = (value) => {
    if (!snapEnabled) return value;
    return Math.round(value / snapGrid) * snapGrid;
  };

  // Get canvas bounds for centering calculations
  const getCanvasBounds = () => {
    if (!canvasRef.current) return { width: 1000, height: 700 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  };

  // Element drag start
  const handleElementMouseDown = (e, element) => {
    if (e.button === 2) return; // Ignore right click
    e.stopPropagation();
    setSelectedElement(element.id);
    setIsDragging(true);
    setContextMenu(null);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
  };

  // Resize start from edges
  const handleResizeStart = (e, element, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(element.id);
    setIsResizing(true);
    setResizeHandle(handle);
    setContextMenu(null);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSize({ 
      width: element.width, 
      height: element.height,
      x: element.x,
      y: element.y
    });
  };

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (isDragging && selectedElement && !isResizing) {
      const element = layoutElements.find(el => el.id === selectedElement);
      if (!element) return;

      const newX = snapToGrid(e.clientX - dragStart.x);
      const newY = snapToGrid(e.clientY - dragStart.y);

      const updatedElements = layoutElements.map(el =>
        el.id === selectedElement ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) } : el
      );

      updateConfig('layout', {
        ...config.layout,
        elements: updatedElements
      });
    }

    if (isResizing && selectedElement && resizeHandle) {
      const element = layoutElements.find(el => el.id === selectedElement);
      if (!element) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialSize.x;
      let newY = initialSize.y;

      // Handle resize based on which edge/corner
      if (resizeHandle.includes('e')) {
        newWidth = snapToGrid(Math.max(50, initialSize.width + deltaX));
      }
      if (resizeHandle.includes('w')) {
        const widthChange = snapToGrid(deltaX);
        newWidth = Math.max(50, initialSize.width - widthChange);
        newX = initialSize.x + (initialSize.width - newWidth);
      }
      if (resizeHandle.includes('s')) {
        newHeight = snapToGrid(Math.max(30, initialSize.height + deltaY));
      }
      if (resizeHandle.includes('n')) {
        const heightChange = snapToGrid(deltaY);
        newHeight = Math.max(30, initialSize.height - heightChange);
        newY = initialSize.y + (initialSize.height - newHeight);
      }

      const updatedElements = layoutElements.map(el =>
        el.id === selectedElement 
          ? { ...el, width: newWidth, height: newHeight, x: newX, y: newY } 
          : el
      );

      updateConfig('layout', {
        ...config.layout,
        elements: updatedElements
      });
    }
  }, [isDragging, isResizing, selectedElement, resizeHandle, dragStart, initialSize, layoutElements, config.layout, updateConfig, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Right-click context menu
  const handleContextMenu = (e, element) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(element.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      element
    });
  };

  // Close context menu on click outside
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setContextMenu(null);
    }
  };

  // Context menu actions
  const deleteElement = () => {
    const updatedElements = layoutElements.filter(el => el.id !== contextMenu.element.id);
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
    setSelectedElement(null);
  };

  const copyElement = () => {
    setClipboard({ ...contextMenu.element });
    setContextMenu(null);
  };

  const pasteElement = () => {
    if (!clipboard) return;
    const newElement = {
      ...clipboard,
      id: Date.now() + Math.random(),
      x: clipboard.x + 20,
      y: clipboard.y + 20
    };
    updateConfig('layout', { ...config.layout, elements: [...layoutElements, newElement] });
    setContextMenu(null);
  };

  const alignElement = (alignment) => {
    const canvasBounds = getCanvasBounds();
    const element = contextMenu.element;
    let newX = element.x;
    let newY = element.y;

    switch (alignment) {
      case 'left':
        newX = 20;
        break;
      case 'center-h':
        newX = (canvasBounds.width - element.width) / 2;
        break;
      case 'right':
        newX = canvasBounds.width - element.width - 20;
        break;
      case 'top':
        newY = 20;
        break;
      case 'center-v':
        newY = (canvasBounds.height - element.height) / 2;
        break;
      case 'bottom':
        newY = canvasBounds.height - element.height - 20;
        break;
    }

    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, x: snapToGrid(newX), y: snapToGrid(newY) } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const changeZIndex = (direction) => {
    const element = contextMenu.element;
    const currentZ = element.zIndex || 0;
    const newZ = direction === 'up' ? currentZ + 1 : Math.max(0, currentZ - 1);
    
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, zIndex: newZ } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Close context menu on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
      if (e.key === 'Delete' && selectedElement) {
        const updatedElements = layoutElements.filter(el => el.id !== selectedElement);
        updateConfig('layout', { ...config.layout, elements: updatedElements });
        setSelectedElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, layoutElements, config.layout, updateConfig]);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-background/50"
      style={{
        backgroundImage: snapEnabled ? `
          linear-gradient(to right, rgba(0, 255, 200, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 255, 200, 0.05) 1px, transparent 1px)
        ` : 'none',
        backgroundSize: snapEnabled ? `${snapGrid}px ${snapGrid}px` : 'auto',
        overflow: 'hidden'
      }}
      onClick={handleCanvasClick}
      data-testid="interactive-canvas"
    >
      {layoutElements.map((element) => (
        <div
          key={element.id}
          className={cn(
            "absolute transition-colors select-none",
            selectedElement === element.id
              ? "border-2 border-[#00ffc8] bg-[#00ffc8]/10"
              : "border-2 border-[#00ffc8]/30 bg-[#00c8ff]/5 hover:border-[#00ffc8]/50",
            isDragging && selectedElement === element.id ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            zIndex: element.zIndex || 0
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
          onContextMenu={(e) => handleContextMenu(e, element)}
          data-testid={`canvas-element-${element.id}`}
        >
          {/* Element label */}
          <div className="absolute top-1 left-1 text-xs font-mono bg-gradient-to-r from-[#00ffc8] to-[#00c8ff] text-black px-2 py-0.5 rounded pointer-events-none">
            {element.label || element.type}
          </div>

          {/* Resize handles - all edges and corners */}
          {selectedElement === element.id && (
            <>
              {/* Corner handles */}
              <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-se-resize shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'se')} />
              <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-sw-resize shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'sw')} />
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-ne-resize shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'ne')} />
              <div className="absolute -left-2 -top-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-nw-resize shadow-[0_0_10px_rgba(0,255,200,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'nw')} />
              
              {/* Edge handles */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#00c8ff] rounded-full cursor-e-resize shadow-[0_0_10px_rgba(0,200,255,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'e')} />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#00c8ff] rounded-full cursor-w-resize shadow-[0_0_10px_rgba(0,200,255,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'w')} />
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-8 h-4 bg-[#00c8ff] rounded-full cursor-n-resize shadow-[0_0_10px_rgba(0,200,255,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 'n')} />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-8 h-4 bg-[#00c8ff] rounded-full cursor-s-resize shadow-[0_0_10px_rgba(0,200,255,0.5)]"
                   onMouseDown={(e) => handleResizeStart(e, element, 's')} />
            </>
          )}

          {/* Position/Size indicator */}
          {selectedElement === element.id && (
            <div className="absolute -top-8 left-0 text-xs bg-black/90 border border-[#00ffc8]/50 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
              {element.width}×{element.height} | X:{Math.round(element.x)} Y:{Math.round(element.y)}
            </div>
          )}
        </div>
      ))}

      {/* Context Menu (Canva-style) */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#00ffc8]/30 rounded-lg shadow-[0_0_30px_rgba(0,255,200,0.2)] py-2 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">
            {contextMenu.element.label || contextMenu.element.type}
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2"
            onClick={copyElement}
          >
            <Copy className="w-4 h-4 text-[#00ffc8]" /> Copy
          </button>
          
          {clipboard && (
            <button 
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2"
              onClick={pasteElement}
            >
              <Clipboard className="w-4 h-4 text-[#00c8ff]" /> Paste
            </button>
          )}
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2"
            onClick={deleteElement}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">
            Align Horizontally
          </div>
          <div className="flex px-2 py-1 gap-1">
            <button 
              className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center"
              onClick={() => alignElement('left')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4 text-[#00ffc8]" />
            </button>
            <button 
              className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center"
              onClick={() => alignElement('center-h')}
              title="Center Horizontally"
            >
              <AlignCenter className="w-4 h-4 text-[#00ffc8]" />
            </button>
            <button 
              className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center"
              onClick={() => alignElement('right')}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4 text-[#00ffc8]" />
            </button>
          </div>
          
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">
            Align Vertically
          </div>
          <div className="flex px-2 py-1 gap-1">
            <button 
              className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded flex items-center justify-center"
              onClick={() => alignElement('top')}
              title="Align Top"
            >
              <AlignStartVertical className="w-4 h-4 text-[#00c8ff]" />
            </button>
            <button 
              className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded flex items-center justify-center"
              onClick={() => alignElement('center-v')}
              title="Center Vertically"
            >
              <AlignCenterVertical className="w-4 h-4 text-[#00c8ff]" />
            </button>
            <button 
              className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded flex items-center justify-center"
              onClick={() => alignElement('bottom')}
              title="Align Bottom"
            >
              <AlignEndVertical className="w-4 h-4 text-[#00c8ff]" />
            </button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">
            Layer Order
          </div>
          <div className="flex px-2 py-1 gap-1">
            <button 
              className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center gap-1 text-xs"
              onClick={() => changeZIndex('up')}
            >
              <MoveUp className="w-4 h-4 text-[#00ffc8]" /> Forward
            </button>
            <button 
              className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center gap-1 text-xs"
              onClick={() => changeZIndex('down')}
            >
              <MoveDown className="w-4 h-4 text-[#00c8ff]" /> Back
            </button>
          </div>
        </div>
      )}

      {/* Selection info panel */}
      {selectedElement && !contextMenu && (
        <div className="absolute bottom-4 left-4 bg-black/90 border border-[#00ffc8]/30 px-3 py-2 rounded-lg text-xs shadow-[0_0_20px_rgba(0,255,200,0.15)]">
          <p className="text-[#00ffc8]/70 mb-1">Selected</p>
          <p className="font-mono text-white">
            {layoutElements.find(el => el.id === selectedElement)?.label || 
             layoutElements.find(el => el.id === selectedElement)?.type || 'Unknown'}
          </p>
          <p className="text-[#00c8ff]/60 mt-1 text-[10px]">
            Right-click for options • Delete to remove
          </p>
        </div>
      )}
    </div>
  );
}
