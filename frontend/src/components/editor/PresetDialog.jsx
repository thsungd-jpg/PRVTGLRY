import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PresetDialog({ open, onClose, onSave, loading }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="preset-dialog">
        <DialogHeader>
          <DialogTitle>Save Preset</DialogTitle>
          <DialogDescription>
            Give your PWA configuration a name to save it for later use.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="preset-name">Preset Name</Label>
          <Input
            id="preset-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome PWA"
            className="mt-2"
            data-testid="preset-name-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="cancel-preset-btn">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || loading}
            data-testid="confirm-save-preset-btn"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}