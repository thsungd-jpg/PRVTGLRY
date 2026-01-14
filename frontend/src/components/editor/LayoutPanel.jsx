import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Move, Grid3x3, AlignCenter, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter } from 'lucide-react';
import { toast } from 'sonner';

export default function LayoutPanel({ config, updateConfig }) {
  const layout = config.layout || {
    snapEnabled: true,
    snapGrid: 10,
    autoSpacing: true,
    elements: []
  };

  const updateLayout = (key, value) => {
    updateConfig('layout', { ...layout, [key]: value });
  };

  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      width: type === 'video' ? 640 : type === 'image' ? 300 : 200,
      height: type === 'video' ? 360 : type === 'image' ? 200 : 100,
      rotation: 0,
      zIndex: layout.elements.length
    };

    updateLayout('elements', [...layout.elements, newElement]);
    toast.success(`${type} element added`);
  };

  const updateElement = (id, updates) => {
    const updated = layout.elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    updateLayout('elements', updated);
  };

  const deleteElement = (id) => {
    const updated = layout.elements.filter(el => el.id !== id);
    updateLayout('elements', updated);
    toast.success('Element removed');
  };

  const autoAlign = (direction) => {
    const elements = [...layout.elements];
    if (elements.length === 0) return;

    const canvasWidth = 1000;
    const canvasHeight = 800;

    if (direction === 'horizontal') {
      // Distribute horizontally with equal spacing
      elements.sort((a, b) => a.x - b.x);
      const totalWidth = elements.reduce((sum, el) => sum + el.width, 0);
      const availableSpace = canvasWidth - totalWidth;
      const spacing = layout.autoSpacing ? availableSpace / (elements.length + 1) : 20;
      
      let currentX = spacing;
      elements.forEach(el => {
        el.x = Math.round(currentX);
        currentX += el.width + spacing;
      });
    } else if (direction === 'vertical') {
      // Distribute vertically with equal spacing
      elements.sort((a, b) => a.y - b.y);
      const totalHeight = elements.reduce((sum, el) => sum + el.height, 0);
      const availableSpace = canvasHeight - totalHeight;
      const spacing = layout.autoSpacing ? availableSpace / (elements.length + 1) : 20;
      
      let currentY = spacing;
      elements.forEach(el => {
        el.y = Math.round(currentY);
        currentY += el.height + spacing;
      });
    } else if (direction === 'center') {
      // Center all elements
      elements.forEach(el => {
        el.x = Math.round((canvasWidth - el.width) / 2);
        el.y = Math.round((canvasHeight - el.height) / 2);
      });
    }

    updateLayout('elements', elements);
    toast.success('Elements aligned!');
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {/* Snap & Grid Settings */}
        <div className="property-group">
          <h3 className="property-label">Snap & Grid</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="snap-enabled" className="text-xs">Snap to Grid</Label>
              <Switch
                id="snap-enabled"
                checked={layout.snapEnabled}
                onCheckedChange={(checked) => updateLayout('snapEnabled', checked)}
                data-testid="snap-enabled-switch"
              />
            </div>

            <div>
              <Label htmlFor="snap-grid" className="text-xs">
                Grid Size (px): {layout.snapGrid}
              </Label>
              <input
                id="snap-grid"
                type="range"
                min="5"
                max="50"
                step="5"
                value={layout.snapGrid}
                onChange={(e) => updateLayout('snapGrid', parseInt(e.target.value))}
                className="w-full mt-2"
                data-testid="snap-grid-slider"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-spacing" className="text-xs">Auto Spacing</Label>
              <Switch
                id="auto-spacing"
                checked={layout.autoSpacing}
                onCheckedChange={(checked) => updateLayout('autoSpacing', checked)}
                data-testid="auto-spacing-switch"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Auto Align */}
        <div className="property-group">
          <h3 className="property-label">Auto Align</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => autoAlign('horizontal')}
              className="flex flex-col h-auto py-2"
              data-testid="align-horizontal-btn"
            >
              <AlignHorizontalJustifyCenter className="w-4 h-4 mb-1" />
              <span className="text-xs">Horizontal</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => autoAlign('vertical')}
              className="flex flex-col h-auto py-2"
              data-testid="align-vertical-btn"
            >
              <AlignVerticalJustifyCenter className="w-4 h-4 mb-1" />
              <span className="text-xs">Vertical</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => autoAlign('center')}
              className="flex flex-col h-auto py-2"
              data-testid="align-center-btn"
            >
              <AlignCenter className="w-4 h-4 mb-1" />
              <span className="text-xs">Center</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Add Elements */}
        <div className="property-group">
          <h3 className="property-label">Add Element</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement('image')}
              data-testid="add-image-element-btn"
            >
              Image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement('video')}
              data-testid="add-video-element-btn"
            >
              Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement('text')}
              data-testid="add-text-element-btn"
            >
              Text
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addElement('audio')}
              data-testid="add-audio-element-btn"
            >
              Audio
            </Button>
          </div>
        </div>

        <Separator />

        {/* Elements List */}
        <div className="property-group">
          <h3 className="property-label">Elements ({layout.elements.length})</h3>
          {layout.elements.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No elements added</p>
          ) : (
            <div className="space-y-3">
              {layout.elements.map((element) => (
                <div
                  key={element.id}
                  className="control-section p-2"
                  data-testid={`element-${element.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-medium capitalize">{element.type}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteElement(element.id)}
                      className="h-6 px-2"
                      data-testid={`delete-element-${element.id}`}
                    >
                      ×
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X: {element.x}</Label>
                        <Input
                          type="number"
                          value={element.x}
                          onChange={(e) => updateElement(element.id, { x: parseInt(e.target.value) || 0 })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y: {element.y}</Label>
                        <Input
                          type="number"
                          value={element.y}
                          onChange={(e) => updateElement(element.id, { y: parseInt(e.target.value) || 0 })}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">W: {element.width}</Label>
                        <Input
                          type="number"
                          value={element.width}
                          onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) || 100 })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">H: {element.height}</Label>
                        <Input
                          type="number"
                          value={element.height}
                          onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) || 100 })}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Rotation: {element.rotation}°</Label>
                        <Input
                          type="number"
                          value={element.rotation}
                          onChange={(e) => updateElement(element.id, { rotation: parseInt(e.target.value) || 0 })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Z-Index: {element.zIndex}</Label>
                        <Input
                          type="number"
                          value={element.zIndex}
                          onChange={(e) => updateElement(element.id, { zIndex: parseInt(e.target.value) || 0 })}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}