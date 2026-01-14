import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function InteractiveCanvas({ config, updateConfig }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const layoutElements = config.layout?.elements || [];
  const snapEnabled = config.layout?.snapEnabled || false;
  const snapGrid = config.layout?.snapGrid || 10;

  const snapToGrid = (value) => {
    if (!snapEnabled) return value;
    return Math.round(value / snapGrid) * snapGrid;
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    setSelectedElement(element.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const element = layoutElements.find(el => el.id === selectedElement);
    if (!element) return;

    const newX = snapToGrid(e.clientX - dragStart.x);
    const newY = snapToGrid(e.clientY - dragStart.y);

    const updatedElements = layoutElements.map(el =>
      el.id === selectedElement ? { ...el, x: newX, y: newY } : el
    );

    updateConfig('layout', {
      ...config.layout,
      elements: updatedElements
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e, element, handle) => {
    e.stopPropagation();
    setSelectedElement(element.id);
    // Implement resize logic
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, selectedElement, dragStart]);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-background/50"
      style={{
        backgroundImage: snapEnabled ? `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        ` : 'none',
        backgroundSize: snapEnabled ? `${snapGrid}px ${snapGrid}px` : 'auto'
      }}
      data-testid="interactive-canvas"
    >
      {layoutElements.map((element) => (
        <div
          key={element.id}
          className={cn(
            "absolute border-2 transition-colors cursor-move",
            selectedElement === element.id
              ? "border-primary bg-primary/10"
              : "border-primary/30 bg-primary/5 hover:border-primary/50"
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
          data-testid={`canvas-element-${element.id}`}
        >
          {/* Element label */}
          <div className="absolute top-1 left-1 text-xs font-mono bg-primary/80 text-primary-foreground px-2 py-0.5 rounded pointer-events-none">
            {element.type}
          </div>

          {/* Resize handles */}
          {selectedElement === element.id && (
            <>
              <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                   onMouseDown={(e) => handleResizeStart(e, element, 'se')} />
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-e-resize"
                   onMouseDown={(e) => handleResizeStart(e, element, 'e')} />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-s-resize"
                   onMouseDown={(e) => handleResizeStart(e, element, 's')} />
            </>
          )}

          {/* Position indicator */}
          {selectedElement === element.id && (
            <div className="absolute -top-6 left-0 text-xs bg-background border border-primary px-2 py-1 rounded pointer-events-none">
              X: {element.x} Y: {element.y}
            </div>
          )}
        </div>
      ))}

      {/* Selection info */}
      {selectedElement && (
        <div className="absolute bottom-4 left-4 bg-background border border-primary px-3 py-2 rounded-lg text-xs">
          <p className="text-muted-foreground mb-1">Selected Element</p>
          <p className="font-mono">
            {layoutElements.find(el => el.id === selectedElement)?.type || 'Unknown'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {snapEnabled ? `Snap: ${snapGrid}px` : 'Snap: Off'}
          </p>
        </div>
      )}
    </div>
  );
}