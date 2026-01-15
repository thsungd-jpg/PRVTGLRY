import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Trash2, Copy, Clipboard, AlignLeft, AlignCenter, AlignRight, 
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  MoveUp, MoveDown, RotateCw, RotateCcw, Lock, Unlock, 
  FlipHorizontal, FlipVertical, Maximize, Minimize, Eye, EyeOff,
  Edit2, Sparkles, Play, Pause
} from 'lucide-react';

export default function InteractiveCanvas({ config, updateConfig, onElementDoubleClick, onGlowEdit, deviceDimensions, pageNavigation, onNavigateNext, onNavigatePrev }) {
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
  const touchStartRef = useRef(null);

  const layoutElements = config.layout?.elements || [];
  const snapEnabled = config.layout?.snapEnabled || false;
  const snapGrid = config.layout?.snapGrid || 10;
  const textSections = config.text_sections || {};
  const playerFrame = config.player_frame || 'glassmorphism';
  const isAllSelected = selectedElement === 'all';

  // Player frame styles
  const frameStyles = {
    minimal: { borderRadius: '4px', border: 'none', boxShadow: 'none', background: 'transparent' },
    rounded: { borderRadius: '16px', border: '2px solid rgba(0,255,200,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.3)' },
    glassmorphism: { borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' },
    neon: { borderRadius: '8px', border: '2px solid #00ffc8', boxShadow: '0 0 20px rgba(0,255,200,0.4), inset 0 0 20px rgba(0,255,200,0.1)', background: 'rgba(0,0,0,0.5)' },
    retro: { borderRadius: '0', border: '4px solid #00c8ff', boxShadow: '4px 4px 0 #00ffc8', background: '#0a0a0a' },
  };

  const currentFrameStyle = frameStyles[playerFrame] || frameStyles.glassmorphism;

  const snapToGrid = (value) => {
    if (!snapEnabled) return value;
    return Math.round(value / snapGrid) * snapGrid;
  };

  const getCanvasBounds = () => {
    if (!canvasRef.current) return { width: 800, height: 560 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  };


  // Get text content for element
  const getElementContent = (element) => {
    switch (element.type) {
      case 'title': return textSections.title || config.app_name || 'Title';
      case 'header': return textSections.header || element.label || 'Header';
      case 'subHeader': return textSections.subHeader || element.label || 'Sub Header';
      case 'footer': return textSections.footer || element.label || 'Footer';
      case 'subFooter': return textSections.subFooter || element.label || 'Sub Footer';
      case 'text': return element.label || 'Text';
      default: return element.label || element.type;
    }
  };

  // Generate glow style for element
  const getGlowStyle = (element) => {
    const glow = element.glow;
    if (!glow?.enabled) return {};
    
    const color = glow.color || '#00ffc8';
    const intensity = glow.intensity || 20;
    const spread = glow.spread || 10;
    
    let boxShadow = `0 0 ${intensity}px ${spread}px ${color}`;
    
    // Add animation classes will be handled by CSS
    return { boxShadow };
  };

  // Element drag start
  const handleElementMouseDown = (e, element) => {
    if (e.button === 2) return;
    e.stopPropagation();
    setSelectedElement(element.id);
    setIsDragging(true);
    setContextMenu(null);
    setEditingText(null);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    const offsetX = rect ? e.clientX - rect.left : e.clientX;
    const offsetY = rect ? e.clientY - rect.top : e.clientY;
    
    setDragStart({
      x: offsetX - element.x,
      y: offsetY - element.y
    });
  };

  // Double-click to edit text
  const handleElementDoubleClick = (e, element) => {
    e.stopPropagation();
    if (['title', 'header', 'subHeader', 'footer', 'subFooter', 'text'].includes(element.type)) {
      setEditingText(element.id);
      setEditValue(getElementContent(element));
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (onElementDoubleClick) {
      onElementDoubleClick(element);
    }
  };

  const saveEditedText = () => {
    if (editingText && editValue.trim()) {
      const element = layoutElements.find(el => el.id === editingText);
      if (element) {
        // Update text sections if it's a section type
        if (['title', 'header', 'subHeader', 'footer', 'subFooter'].includes(element.type)) {
          const sectionKey = element.type === 'subHeader' ? 'subHeader' : element.type === 'subFooter' ? 'subFooter' : element.type;
          updateConfig('text_sections', { ...config.text_sections, [sectionKey]: editValue.trim() });
        } else {
          const updatedElements = layoutElements.map(el =>
            el.id === editingText ? { ...el, label: editValue.trim() } : el
          );
          updateConfig('layout', { ...config.layout, elements: updatedElements });
        }
      }
    }
    setEditingText(null);
    setEditValue('');
  };

  // Resize start
  const handleResizeStart = (e, element, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(element.id);
    setIsResizing(true);
    setResizeHandle(handle);
    setContextMenu(null);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: element.width, height: element.height, x: element.x, y: element.y });
  };

  // Mouse move
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (isDragging && selectedElement && !isResizing && !isAllSelected) {
      const element = layoutElements.find(el => el.id === selectedElement);
      if (!element || element.locked) return;

      const offsetX = rect ? e.clientX - rect.left : e.clientX;
      const offsetY = rect ? e.clientY - rect.top : e.clientY;
      
      const newX = snapToGrid(offsetX - dragStart.x);
      const newY = snapToGrid(offsetY - dragStart.y);

      const updatedElements = layoutElements.map(el =>
        el.id === selectedElement ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) } : el
      );
      updateConfig('layout', { ...config.layout, elements: updatedElements });
    }

    if (isResizing && selectedElement && resizeHandle && !isAllSelected) {
      const element = layoutElements.find(el => el.id === selectedElement);
      if (!element || element.locked) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      let newX = initialSize.x;
      let newY = initialSize.y;

      if (resizeHandle.includes('e')) newWidth = snapToGrid(Math.max(50, initialSize.width + deltaX));
      if (resizeHandle.includes('w')) {
        const widthChange = snapToGrid(deltaX);
        newWidth = Math.max(50, initialSize.width - widthChange);
        newX = initialSize.x + (initialSize.width - newWidth);
      }
      if (resizeHandle.includes('s')) newHeight = snapToGrid(Math.max(30, initialSize.height + deltaY));
      if (resizeHandle.includes('n')) {
        const heightChange = snapToGrid(deltaY);
        newHeight = Math.max(30, initialSize.height - heightChange);
        newY = initialSize.y + (initialSize.height - newHeight);
      }

      const updatedElements = layoutElements.map(el =>
        el.id === selectedElement ? { ...el, width: newWidth, height: newHeight, x: newX, y: newY } : el
      );
      updateConfig('layout', { ...config.layout, elements: updatedElements });
    }
  }, [isDragging, isResizing, selectedElement, resizeHandle, dragStart, initialSize, layoutElements, config.layout, updateConfig, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Context menu
  const handleContextMenu = (e, element) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(element.id);
    setContextMenu({ x: e.clientX, y: e.clientY, element });
  };

  const handleCanvasClick = (e) => {
    const isWithinCanvas = !!canvasRef.current && canvasRef.current.contains(e.target);
    const isElementClick = !!e.target.closest('[data-testid^="canvas-element-"]');
    const isBackgroundClick = isWithinCanvas && !isElementClick;
    if (isBackgroundClick) {
      setSelectedElement(null);
      setContextMenu(null);
      if (editingText) saveEditedText();
      if (pageNavigation?.clickEnabled && !isDragging && !isResizing && !editingText) {
        const rect = canvasRef.current?.getBoundingClientRect();
        const clickX = rect ? e.clientX - rect.left : e.clientX;
        const midpoint = rect ? rect.width / 2 : 0;
        if (rect && clickX >= midpoint) {
          onNavigatePrev?.();
        } else {
          onNavigateNext?.();
        }
      }
    }
  };

  const handleTouchStart = (e) => {
    if (!pageNavigation?.swipeEnabled) return;
    touchStartRef.current = e.changedTouches?.[0]?.screenX ?? null;
  };

  const handleTouchEnd = (e) => {
    if (!pageNavigation?.swipeEnabled) return;
    const startX = touchStartRef.current;
    const endX = e.changedTouches?.[0]?.screenX ?? null;
    if (startX == null || endX == null) return;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onNavigateNext?.();
      else onNavigatePrev?.();
    }
    touchStartRef.current = null;
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
    const newElement = { ...clipboard, id: Date.now() + Math.random(), x: clipboard.x + 20, y: clipboard.y + 20 };
    updateConfig('layout', { ...config.layout, elements: [...layoutElements, newElement] });
    setContextMenu(null);
  };

  const duplicateElement = () => {
    const newElement = { ...contextMenu.element, id: Date.now() + Math.random(), x: contextMenu.element.x + 20, y: contextMenu.element.y + 20 };
    updateConfig('layout', { ...config.layout, elements: [...layoutElements, newElement] });
    setContextMenu(null);
  };

  const getSelectedElement = () => {
    if (!selectedElement || isAllSelected) return null;
    return layoutElements.find(el => el.id === selectedElement);
  };


  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    const updatedElements = isAllSelected ? [] : layoutElements.filter(el => el.id !== selectedElement);
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setSelectedElement(null);
  };

  const copySelectedElement = () => {
    if (isAllSelected) {
      setClipboard(layoutElements.map(el => ({ ...el })));
      return;
    }
    const element = getSelectedElement();
    if (!element) return;
    setClipboard({ ...element });
  };

  const pasteClipboardElement = () => {
    if (!clipboard) return;
    if (Array.isArray(clipboard)) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: Date.now() + Math.random(),
        x: el.x + 20,
        y: el.y + 20
      }));
      updateConfig('layout', { ...config.layout, elements: [...layoutElements, ...newElements] });
      setSelectedElement('all');
      return;
    }
    const newElement = { ...clipboard, id: Date.now() + Math.random(), x: clipboard.x + 20, y: clipboard.y + 20 };
    updateConfig('layout', { ...config.layout, elements: [...layoutElements, newElement] });
    setSelectedElement(newElement.id);
  };

  const duplicateSelectedElement = () => {
    if (isAllSelected) {
      const newElements = layoutElements.map(el => ({
        ...el,
        id: Date.now() + Math.random(),
        x: el.x + 20,
        y: el.y + 20
      }));
      updateConfig('layout', { ...config.layout, elements: [...layoutElements, ...newElements] });
      setSelectedElement('all');
      return;
    }
    const element = getSelectedElement();
    if (!element) return;
    const newElement = { ...element, id: Date.now() + Math.random(), x: element.x + 20, y: element.y + 20 };
    updateConfig('layout', { ...config.layout, elements: [...layoutElements, newElement] });
    setSelectedElement(newElement.id);
  };

  const nudgeSelectedElement = (dx, dy) => {
    const bounds = getCanvasBounds();

    if (isAllSelected) {
      if (layoutElements.length === 0) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      layoutElements.forEach(el => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });
      const nextMinX = minX + dx;
      const nextMinY = minY + dy;
      const nextMaxX = maxX + dx;
      const nextMaxY = maxY + dy;
      const clampedDx = Math.min(Math.max(dx, -nextMinX), bounds.width - nextMaxX);
      const clampedDy = Math.min(Math.max(dy, -nextMinY), bounds.height - nextMaxY);
      const updatedElements = layoutElements.map(el => ({
        ...el,
        x: snapToGrid(el.x + clampedDx),
        y: snapToGrid(el.y + clampedDy)
      }));
      updateConfig('layout', { ...config.layout, elements: updatedElements });
      return;
    }

    const element = getSelectedElement();
    if (!element) return;
    const nextX = snapToGrid(element.x + dx);
    const nextY = snapToGrid(element.y + dy);
    const clampedX = Math.max(0, Math.min(nextX, bounds.width - element.width));
    const clampedY = Math.max(0, Math.min(nextY, bounds.height - element.height));
    const updatedElements = layoutElements.map(el =>
      el.id === element.id ? { ...el, x: clampedX, y: clampedY } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
  };

  const alignElement = (alignment) => {
    const bounds = getCanvasBounds();
    const element = contextMenu.element;
    let newX = element.x, newY = element.y;

    switch (alignment) {
      case 'left': newX = 10; break;
      case 'center-h': newX = (bounds.width - element.width) / 2; break;
      case 'right': newX = bounds.width - element.width - 10; break;
      case 'top': newY = 10; break;
      case 'center-v': newY = (bounds.height - element.height) / 2; break;
      case 'bottom': newY = bounds.height - element.height - 10; break;
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
    const updatedElements = layoutElements.map(el => el.id === element.id ? { ...el, zIndex: newZ } : el);
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const rotateElement = (degrees) => {
    const element = contextMenu.element;
    const newRotation = ((element.rotation || 0) + degrees) % 360;
    const updatedElements = layoutElements.map(el => el.id === element.id ? { ...el, rotation: newRotation } : el);
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const flipElement = (direction) => {
    const element = contextMenu.element;
    const key = direction === 'horizontal' ? 'flipX' : 'flipY';
    const updatedElements = layoutElements.map(el => el.id === element.id ? { ...el, [key]: !el[key] } : el);
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const toggleLock = () => {
    const updatedElements = layoutElements.map(el => el.id === contextMenu.element.id ? { ...el, locked: !el.locked } : el);
    updateConfig('layout', { ...config.layout, elements: updatedElements });
    setContextMenu(null);
  };

  const toggleVisibility = () => {
    const updatedElements = layoutElements.map(el => el.id === contextMenu.element.id ? { ...el, hidden: !el.hidden } : el);
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
      const target = e.target;
      const isTypingTarget =
        target &&
        ((target.tagName === 'INPUT') || (target.tagName === 'TEXTAREA') || target.isContentEditable);

      if (e.key === 'Escape') { setContextMenu(null); if (editingText) saveEditedText(); }
      if (e.key === 'Enter' && editingText) saveEditedText();

      if (editingText || isTypingTarget) return;

      const isMod = e.metaKey || e.ctrlKey;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        deleteSelectedElement();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (layoutElements.length > 0) {
          setSelectedElement('all');
          setContextMenu(null);
        }
        return;
      }

      if (isMod && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelectedElement();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteClipboardElement();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      const step = isMod ? 1 : 10;
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSelectedElement(-step, 0); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSelectedElement(step, 0); }
      if (e.key === 'ArrowUp') { e.preventDefault(); nudgeSelectedElement(0, -step); }
      if (e.key === 'ArrowDown') { e.preventDefault(); nudgeSelectedElement(0, step); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, editingText, layoutElements, config.layout, updateConfig, clipboard]);

  // Render element content
  const renderElementContent = (element) => {
    const isText = ['title', 'header', 'subHeader', 'footer', 'subFooter', 'text'].includes(element.type);
    const font = element.font || config.global_font || 'Inter';
    
    // Text elements
    if (isText) {
      const content = getElementContent(element);
      const isTitle = element.type === 'title';
      const isSmall = ['footer', 'subFooter'].includes(element.type);
      
      return (
        <div 
          className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
          style={{ 
            fontFamily: font,
            color: config.text_color || '#fff',
            fontSize: isTitle ? 'clamp(1rem, 4vw, 2rem)' : isSmall ? '0.75rem' : '1rem',
            fontWeight: isTitle ? 700 : 400,
            textAlign: 'center',
            background: isTitle ? 'transparent' : 'rgba(0,0,0,0.2)',
            ...(isTitle ? {
              background: 'linear-gradient(135deg, #00ffc8 0%, #00c8ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : {})
          }}
        >
          {content}
        </div>
      );
    }
    
    // Image elements
    if (element.type === 'image') {
      if (element.mediaUrl) {
        return <img src={element.mediaUrl} alt={element.label} className="w-full h-full object-cover" style={{ borderRadius: currentFrameStyle.borderRadius }} />;
      }
      // Find matching gallery image
      const galleryImages = config.gallery_images || [];
      const imgIndex = layoutElements.filter(e => e.type === 'image').indexOf(element);
      const img = galleryImages[imgIndex % Math.max(1, galleryImages.length)];
      if (img) {
        return <img src={img.url} alt={img.name} className="w-full h-full object-cover" style={{ borderRadius: currentFrameStyle.borderRadius }} />;
      }
      return <div className="w-full h-full flex items-center justify-center bg-black/30 text-xs text-[#00ffc8]/50">Image</div>;
    }
    
    // Video elements
    if (element.type === 'video') {
      if (element.mediaUrl) {
        return (
          <video 
            src={element.mediaUrl} 
            className="w-full h-full object-cover" 
            style={{ ...currentFrameStyle }}
            controls
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      const videoTracks = config.video_tracks || [];
      const vidIndex = layoutElements.filter(e => e.type === 'video').indexOf(element);
      const vid = videoTracks[vidIndex % Math.max(1, videoTracks.length)];
      if (vid) {
        return (
          <video 
            src={vid.url} 
            className="w-full h-full object-cover" 
            style={{ ...currentFrameStyle }}
            controls
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      return <div className="w-full h-full flex items-center justify-center bg-black/50 text-xs text-[#00ffc8]/50" style={{ ...currentFrameStyle }}><Play className="w-8 h-8 opacity-50" /></div>;
    }
    
    // Audio elements
    if (element.type === 'audio') {
      if (element.mediaUrl) {
        return (
          <div className="w-full h-full flex items-center justify-center p-2" style={{ ...currentFrameStyle, background: 'rgba(0,0,0,0.5)' }}>
            <audio src={element.mediaUrl} controls className="w-full" onClick={(e) => e.stopPropagation()} />
          </div>
        );
      }
      const audioTracks = config.audio_tracks || [];
      const audIndex = layoutElements.filter(e => e.type === 'audio').indexOf(element);
      const aud = audioTracks[audIndex % Math.max(1, audioTracks.length)];
      if (aud) {
        return (
          <div className="w-full h-full flex items-center justify-center p-2" style={{ ...currentFrameStyle, background: 'rgba(0,0,0,0.5)' }}>
            <audio src={aud.url} controls className="w-full" onClick={(e) => e.stopPropagation()} />
          </div>
        );
      }
      return <div className="w-full h-full flex items-center justify-center bg-black/50 text-xs text-[#00ffc8]/50" style={{ ...currentFrameStyle }}>🎵 Audio</div>;
    }
    
    return <div className="w-full h-full flex items-center justify-center text-xs opacity-50">{element.label || element.type}</div>;
  };

  return (
    <div 
      ref={canvasRef}
      className="canvas-bg relative w-full h-full"
      style={{
        background: config.background_color || '#000',
        backgroundImage: snapEnabled ? `
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        ` : 'none',
        backgroundSize: snapEnabled ? `${snapGrid}px ${snapGrid}px` : 'auto',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="interactive-canvas"
    >
      {/* Background images */}
      {(config.background_images || []).length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${config.background_images[0].url})` }}
          />
        </div>
      )}

      {/* Elements */}
      {layoutElements.filter(el => !el.hidden).map((element) => (
        <div
          key={element.id}
          className={cn(
            "absolute cursor-move transition-shadow",
            element.locked && "cursor-not-allowed",
            (selectedElement === element.id || isAllSelected) && "ring-2 ring-[#00ffc8] ring-offset-2 ring-offset-transparent"
          )}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
            zIndex: element.zIndex || 0,
            ...getGlowStyle(element)
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
          onDoubleClick={(e) => handleElementDoubleClick(e, element)}
          onContextMenu={(e) => handleContextMenu(e, element)}
          data-testid={`canvas-element-${element.id}`}
        >
          {/* Inline text editor */}
          {editingText === element.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEditedText}
              className="absolute inset-0 bg-black/90 border-2 border-[#00ffc8] rounded px-3 text-white focus:outline-none"
              style={{ 
                fontFamily: element.font || config.global_font,
                fontSize: element.type === 'title' ? '1.5rem' : '1rem'
              }}
            />
          ) : (
            <>
              {renderElementContent(element)}
              
              {/* Selection overlay with label */}
              {selectedElement === element.id && (
                <div className="absolute -top-6 left-0 px-2 py-0.5 bg-[#00ffc8] text-black text-[10px] font-bold rounded whitespace-nowrap">
                  {element.label || element.type} • {Math.round(element.width)}×{Math.round(element.height)}
                </div>
              )}
            </>
          )}

          {/* Lock indicator */}
          {element.locked && (
            <div className="absolute top-1 right-1 bg-black/50 rounded p-1">
              <Lock className="w-3 h-3 text-[#00ffc8]" />
            </div>
          )}

          {/* Resize handles */}
          {selectedElement === element.id && !element.locked && (
            <>
              <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-se-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'se')} />
              <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-sw-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'sw')} />
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-ne-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'ne')} />
              <div className="absolute -left-2 -top-2 w-4 h-4 bg-[#00ffc8] rounded-full cursor-nw-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'nw')} />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#00c8ff] rounded-full cursor-e-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'e')} />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#00c8ff] rounded-full cursor-w-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'w')} />
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-6 h-3 bg-[#00c8ff] rounded-full cursor-n-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 'n')} />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-6 h-3 bg-[#00c8ff] rounded-full cursor-s-resize shadow-lg" onMouseDown={(e) => handleResizeStart(e, element, 's')} />
            </>
          )}
        </div>
      ))}

      {/* Empty state */}
      {layoutElements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold neon-text mb-2" style={{ fontFamily: config.global_font }}>
              PRVT
            </div>
            <p className="text-xs text-white/50">Apply a template or add elements</p>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#00ffc8]/30 rounded-lg shadow-2xl py-2 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50 uppercase tracking-wider border-b border-[#00ffc8]/10 mb-1">
            {contextMenu.element.label || contextMenu.element.type}
          </div>
          
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={() => { onElementDoubleClick?.(contextMenu.element); setContextMenu(null); }}>
            <Edit2 className="w-4 h-4 text-[#00ffc8]" /> Edit Properties
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={() => { onGlowEdit?.(contextMenu.element); setContextMenu(null); }}>
            <Sparkles className="w-4 h-4 text-[#00ffc8]" /> Edit Glow Effects
          </button>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={copyElement}><Copy className="w-4 h-4 text-[#00ffc8]" /> Copy</button>
          {clipboard && <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={pasteElement}><Clipboard className="w-4 h-4 text-[#00c8ff]" /> Paste</button>}
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={duplicateElement}><Copy className="w-4 h-4 text-[#00c8ff]" /> Duplicate</button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 text-red-400 flex items-center gap-2" onClick={deleteElement}><Trash2 className="w-4 h-4" /> Delete</button>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50">Align</div>
          <div className="flex px-2 gap-1">
            {[['left', AlignLeft], ['center-h', AlignCenter], ['right', AlignRight], ['top', AlignStartVertical], ['center-v', AlignCenterVertical], ['bottom', AlignEndVertical]].map(([align, Icon]) => (
              <button key={align} className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => alignElement(align)}><Icon className="w-4 h-4 text-[#00ffc8]" /></button>
            ))}
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50">Layer</div>
          <div className="flex px-2 gap-1">
            <button className="flex-1 p-1.5 hover:bg-[#00ffc8]/10 rounded text-[10px]" onClick={() => changeZIndex('front')}>Front</button>
            <button className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => changeZIndex('up')}><MoveUp className="w-4 h-4 text-[#00ffc8]" /></button>
            <button className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => changeZIndex('down')}><MoveDown className="w-4 h-4 text-[#00c8ff]" /></button>
            <button className="flex-1 p-1.5 hover:bg-[#00ffc8]/10 rounded text-[10px]" onClick={() => changeZIndex('back')}>Back</button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          <div className="px-3 py-1 text-xs text-[#00ffc8]/50">Transform</div>
          <div className="flex px-2 gap-1">
            <button className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => rotateElement(-90)}><RotateCcw className="w-4 h-4 text-[#00ffc8]" /></button>
            <button className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => rotateElement(90)}><RotateCw className="w-4 h-4 text-[#00ffc8]" /></button>
            <button className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => flipElement('horizontal')}><FlipHorizontal className="w-4 h-4 text-[#00c8ff]" /></button>
            <button className="p-1.5 hover:bg-[#00ffc8]/10 rounded" onClick={() => flipElement('vertical')}><FlipVertical className="w-4 h-4 text-[#00c8ff]" /></button>
          </div>
          
          <div className="border-t border-[#00ffc8]/10 my-1" />
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={toggleLock}>
            {contextMenu.element.locked ? <Unlock className="w-4 h-4 text-[#00ffc8]" /> : <Lock className="w-4 h-4 text-[#00ffc8]" />}
            {contextMenu.element.locked ? 'Unlock' : 'Lock'}
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-[#00ffc8]/10 flex items-center gap-2" onClick={toggleVisibility}>
            {contextMenu.element.hidden ? <Eye className="w-4 h-4 text-[#00c8ff]" /> : <EyeOff className="w-4 h-4 text-[#00c8ff]" />}
            {contextMenu.element.hidden ? 'Show' : 'Hide'}
          </button>
        </div>
      )}
    </div>
  );
}
