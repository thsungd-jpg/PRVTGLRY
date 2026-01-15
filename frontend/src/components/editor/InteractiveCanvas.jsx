import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Trash2, Copy, Clipboard, AlignLeft, AlignCenter, AlignRight, 
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  MoveUp, MoveDown, RotateCw, RotateCcw, Lock, Unlock, 
  FlipHorizontal, FlipVertical, Maximize, Minimize, Eye, EyeOff,
  Edit2
} from 'lucide-react';

export default function InteractiveCanvas({ config, updateConfig, onElementDoubleClick, onGlowEdit }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [editingText, setEditingText] = useState(null);
  const [editValue, setEditValue] = useState('');
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  const layoutElements = config.layout?.elements || [];
  const snapEnabled = config.layout?.snapEnabled || false;
  const snapGrid = config.layout?.snapGrid || 10;

  const snapToGrid = (value) => {
    if (!snapEnabled) return value;
    return Math.round(value / snapGrid) * snapGrid;
  };

  const getCanvasBounds = () => {
    if (!canvasRef.current) return { width: 1000, height: 700 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  };

  // Element drag start
  const handleElementMouseDown = (e, element) => {
    if (e.button === 2) return;
    e.stopPropagation();
    setSelectedElement(element.id);
    setIsDragging(true);
    setContextMenu(null);
    setEditingText(null);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
  };

  // Double-click to edit text
  const handleElementDoubleClick = (e, element) => {
    e.stopPropagation();
    
    // For text-type elements, enable inline editing
    if (['title', 'header', 'subHeader', 'footer', 'subFooter', 'text'].includes(element.type)) {
      setEditingText(element.id);
      setEditValue(element.label || element.type);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (onElementDoubleClick) {
      onElementDoubleClick(element);
    }
  };

  // Save edited text
  const saveEditedText = () => {
    if (editingText && editValue.trim()) {
      const updatedElements = layoutElements.map(el =>
        el.id === editingText ? { ...el, label: editValue.trim() } : el
      );
      updateConfig('layout', { ...config.layout, elements: updatedElements });
    }
    setEditingText(null);
    setEditValue('');
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
      if (!element || element.locked) return;

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
      if (!element || element.locked) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialSize.x;
      let newY = initialSize.y;

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
  }, [isDragging, isResizing, selectedElement, resizeHandle, dragStart, initialSize, layoutElements, config.layout, updateConfig]);

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
      if (editingText) saveEditedText();
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

  const duplicateElement = () => {
    const newElement = {
      ...contextMenu.element,
      id: Date.now() + Math.random(),
      x: contextMenu.element.x + 20,
      y: contextMenu.element.y + 20
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
      case 'left': newX = 20; break;
      case 'center-h': newX = (canvasBounds.width - element.width) / 2; break;
      case 'right': newX = canvasBounds.width - element.width - 20; break;
      case 'top': newY = 20; break;
      case 'center-v': newY = (canvasBounds.height - element.height) / 2; break;
      case 'bottom': newY = canvasBounds.height - element.height - 20; break;
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
    let newZ;
    
    switch (direction) {
      case 'front': newZ = Math.max(...layoutElements.map(e => e.zIndex || 0)) + 1; break;
      case 'back': newZ = Math.min(...layoutElements.map(e => e.zIndex || 0)) - 1; break;
      case 'up': newZ = currentZ + 1; break;
      case 'down': newZ = Math.max(0, currentZ - 1); break;
      default: newZ = currentZ;
    }
    
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, zIndex: newZ } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const rotateElement = (degrees) => {
    const element = contextMenu.element;
    const currentRotation = element.rotation || 0;
    const newRotation = (currentRotation + degrees) % 360;
    
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, rotation: newRotation } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const flipElement = (direction) => {
    const element = contextMenu.element;
    const key = direction === 'horizontal' ? 'flipX' : 'flipY';
    const currentFlip = element[key] || false;
    
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, [key]: !currentFlip } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const toggleLock = () => {
    const element = contextMenu.element;
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, locked: !el.locked } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const toggleVisibility = () => {
    const element = contextMenu.element;
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, hidden: !el.hidden } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const fitToCanvas = () => {
    const canvasBounds = getCanvasBounds();
    const element = contextMenu.element;
    const padding = 40;
    
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { 
        ...el, 
        x: padding / 2, 
        y: padding / 2,
        width: canvasBounds.width - padding,
        height: canvasBounds.height - padding
      } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const resetSize = () => {
    const element = contextMenu.element;
    let defaultWidth = 200, defaultHeight = 100;
    
    switch (element.type) {
      case 'image': defaultWidth = 300; defaultHeight = 200; break;
      case 'video': defaultWidth = 400; defaultHeight = 250; break;
      case 'audio': defaultWidth = 400; defaultHeight = 60; break;
      case 'title': defaultWidth = 400; defaultHeight = 60; break;
      default: defaultWidth = 200; defaultHeight = 100;
    }
    
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, width: defaultWidth, height: defaultHeight } : el
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        if (editingText) saveEditedText();
      }
      if (e.key === 'Enter' && editingText) {
        saveEditedText();
      }
      if (e.key === 'Delete' && selectedElement && !editingText) {
        const updatedElements = layoutElements.filter(el => el.id !== selectedElement);
        updateConfig('layout', { ...config.layout, elements: updatedElements });
        setSelectedElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, editingText, layoutElements, config.layout, updateConfig]);

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
      {layoutElements.filter(el => !el.hidden).map((element) => (
        <div
          key={element.id}
          className={cn(
            "absolute transition-colors select-none",
            element.locked ? "cursor-not-allowed opacity-70" : "",
            selectedElement === element.id
              ? "border-2 border-[#00ffc8] bg-[#00ffc8]/10"
              : "border-2 border-[#00ffc8]/30 bg-[#00c8ff]/5 hover:border-[#00ffc8]/50",
            isDragging && selectedElement === element.id && !element.locked ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
            zIndex: element.zIndex || 0
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
          onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          onContextMenu={(e) => handleContextMenu(e, element)}
          data-testid={`canvas-element-${element.id}`}
        >
          {/* Element label or inline editor */}
          {editingText === element.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEditedText}
              className="absolute inset-2 bg-black/80 border border-[#00ffc8] rounded px-2 text-sm text-white focus:outline-none"
              style={{ transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})` }}
            />
          ) : (
            <div className="absolute top-1 left-1 text-xs font-mono bg-gradient-to-r from-[#00ffc8] to-[#00c8ff] text-black px-2 py-0.5 rounded pointer-events-none">
              {element.label || element.type}
            </div>
          )}

          {/* Media preview */}
          {element.mediaUrl && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded">
              {element.type === 'image' && (
                <img src={element.mediaUrl} alt={element.label} className="w-full h-full object-cover" />
              )}
              {element.type === 'video' && (
                <video src={element.mediaUrl} className="w-full h-full object-cover" />
              )}
              {element.type === 'audio' && (
                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                  <span className="text-xs text-[#00ffc8]">🎵 {element.label}</span>
                </div>
              )}
            </div>
          )}

          {/* Lock indicator */}
          {element.locked && (
            <div className="absolute top-1 right-1">
              <Lock className="w-3 h-3 text-[#00ffc8]" />
            </div>
          )}

          {/* Resize handles */}
          {selectedElement === element.id && !element.locked && (
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
              {Math.round(element.width)}×{Math.round(element.height)} | X:{Math.round(element.x)} Y:{Math.round(element.y)}
            </div>
          )}
        </div>
      ))}

      {/* Enhanced Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#00ffc8]/30 rounded-lg shadow-[0_0_30px_rgba(0,255,200,0.2)] py-2 min-w-[220px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">
            {contextMenu.element.label || contextMenu.element.type}
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          {/* Edit */}
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2"
            onClick={() => { onElementDoubleClick?.(contextMenu.element); setContextMenu(null); }}
          >
            <Edit2 className="w-4 h-4 text-[#00ffc8]" /> Edit Properties
          </button>
          
          {/* Copy/Paste */}
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
            className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2"
            onClick={duplicateElement}
          >
            <Copy className="w-4 h-4 text-[#00c8ff]" /> Duplicate
          </button>
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2"
            onClick={deleteElement}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          {/* Alignment */}
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">Align</div>
          <div className="flex px-2 py-1 gap-1">
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => alignElement('left')} title="Left">
              <AlignLeft className="w-4 h-4 text-[#00ffc8] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => alignElement('center-h')} title="Center H">
              <AlignCenter className="w-4 h-4 text-[#00ffc8] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => alignElement('right')} title="Right">
              <AlignRight className="w-4 h-4 text-[#00ffc8] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded" onClick={() => alignElement('top')} title="Top">
              <AlignStartVertical className="w-4 h-4 text-[#00c8ff] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded" onClick={() => alignElement('center-v')} title="Center V">
              <AlignCenterVertical className="w-4 h-4 text-[#00c8ff] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded" onClick={() => alignElement('bottom')} title="Bottom">
              <AlignEndVertical className="w-4 h-4 text-[#00c8ff] mx-auto" />
            </button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          {/* Layer Order */}
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">Layer</div>
          <div className="flex px-2 py-1 gap-1">
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded text-xs" onClick={() => changeZIndex('front')}>
              Front
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => changeZIndex('up')}>
              <MoveUp className="w-4 h-4 text-[#00ffc8] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => changeZIndex('down')}>
              <MoveDown className="w-4 h-4 text-[#00c8ff] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded text-xs" onClick={() => changeZIndex('back')}>
              Back
            </button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          {/* Transform */}
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">Transform</div>
          <div className="flex px-2 py-1 gap-1">
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => rotateElement(-90)} title="Rotate Left">
              <RotateCcw className="w-4 h-4 text-[#00ffc8] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded" onClick={() => rotateElement(90)} title="Rotate Right">
              <RotateCw className="w-4 h-4 text-[#00ffc8] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded" onClick={() => flipElement('horizontal')} title="Flip H">
              <FlipHorizontal className="w-4 h-4 text-[#00c8ff] mx-auto" />
            </button>
            <button className="flex-1 p-2 hover:bg-[#00c8ff]/10 rounded" onClick={() => flipElement('vertical')} title="Flip V">
              <FlipVertical className="w-4 h-4 text-[#00c8ff] mx-auto" />
            </button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          {/* Size */}
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider">Size</div>
          <div className="flex px-2 py-1 gap-1">
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center gap-1 text-xs" onClick={fitToCanvas}>
              <Maximize className="w-3 h-3 text-[#00ffc8]" /> Fit Canvas
            </button>
            <button className="flex-1 p-2 hover:bg-[#00ffc8]/10 rounded flex items-center justify-center gap-1 text-xs" onClick={resetSize}>
              <Minimize className="w-3 h-3 text-[#00c8ff]" /> Reset
            </button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          {/* Lock/Visibility */}
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2"
            onClick={toggleLock}
          >
            {contextMenu.element.locked ? <Unlock className="w-4 h-4 text-[#00ffc8]" /> : <Lock className="w-4 h-4 text-[#00ffc8]" />}
            {contextMenu.element.locked ? 'Unlock' : 'Lock'}
          </button>
          
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2"
            onClick={toggleVisibility}
          >
            {contextMenu.element.hidden ? <Eye className="w-4 h-4 text-[#00c8ff]" /> : <EyeOff className="w-4 h-4 text-[#00c8ff]" />}
            {contextMenu.element.hidden ? 'Show' : 'Hide'}
          </button>
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
            Double-click to edit • Right-click for options • Delete to remove
          </p>
        </div>
      )}
    </div>
  );
}
