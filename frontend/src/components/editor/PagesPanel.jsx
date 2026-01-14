import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const pageTransitions = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'flip', label: 'Flip' },
  { value: 'cube', label: 'Cube Rotate' },
  { value: 'dissolve', label: 'Dissolve' }
];

export default function PagesPanel({ config, updateConfig }) {
  const [newPageName, setNewPageName] = useState('');
  const pages = config.pages || [{ id: 'home', title: 'Home' }];
  const pageTransition = config.page_transition || {
    type: 'fade',
    duration: 500
  };

  const addPage = () => {
    if (!newPageName.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    const newPage = {
      id: newPageName.toLowerCase().replace(/\s+/g, '-'),
      title: newPageName
    };

    updateConfig('pages', [...pages, newPage]);
    setNewPageName('');
    toast.success(`Page "${newPageName}" added!`);
  };

  const removePage = (id) => {
    if (pages.length <= 1) {
      toast.error('Must have at least one page');
      return;
    }

    const updated = pages.filter(p => p.id !== id);
    updateConfig('pages', updated);
    toast.success('Page removed');
  };

  const updatePageTransition = (key, value) => {
    updateConfig('page_transition', {
      ...pageTransition,
      [key]: value
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {/* Page Transition */}
        <div className="property-group">
          <h3 className="property-label">Page Transitions</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="transition-type" className="text-xs">Transition Effect</Label>
              <Select
                value={pageTransition.type}
                onValueChange={(value) => updatePageTransition('type', value)}
              >
                <SelectTrigger className="mt-1" data-testid="transition-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageTransitions.map(transition => (
                    <SelectItem key={transition.value} value={transition.value}>
                      {transition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transition-duration" className="text-xs">
                Duration (ms): {pageTransition.duration}
              </Label>
              <input
                id="transition-duration"
                type="range"
                min="200"
                max="2000"
                step="100"
                value={pageTransition.duration}
                onChange={(e) => updatePageTransition('duration', parseInt(e.target.value))}
                className="w-full mt-2"
                data-testid="transition-duration-slider"
              />
            </div>

            {/* Transition Preview */}
            <div className="bg-muted p-3 rounded-lg flex items-center justify-center gap-2 h-20">
              <div className="w-12 h-12 bg-primary/20 rounded flex items-center justify-center text-xs">Page 1</div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="w-12 h-12 bg-primary/40 rounded flex items-center justify-center text-xs">Page 2</div>
              <p className="text-xs text-muted-foreground ml-2">{pageTransition.type}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Pages List */}
        <div className="property-group">
          <h3 className="property-label">Pages ({pages.length})</h3>
          <div className="space-y-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="control-section p-2 flex items-center justify-between"
                data-testid={`page-${page.id}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-6">{index + 1}.</span>
                  <span className="text-sm font-medium">{page.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePage(page.id)}
                  disabled={pages.length <= 1}
                  className="h-6 px-2"
                  data-testid={`remove-page-${page.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Page */}
        <div className="property-group">
          <h3 className="property-label">Add New Page</h3>
          <div className="flex gap-2">
            <Input
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Page name (e.g., About)"
              onKeyDown={(e) => e.key === 'Enter' && addPage()}
              className="flex-1"
              data-testid="new-page-input"
            />
            <Button
              size="sm"
              onClick={addPage}
              data-testid="add-page-btn"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="text-xs font-semibold text-primary mb-2">How it works</h4>
          <p className="text-xs text-muted-foreground">
            Pages appear as navigation buttons in your PWA. The transition effect plays when users switch between pages.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}