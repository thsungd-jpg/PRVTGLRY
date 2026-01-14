import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Code } from 'lucide-react';
import { toast } from 'sonner';

const animationPresets = [
  { name: 'Fade In', keyframes: '0% { opacity: 0; }\n100% { opacity: 1; }' },
  { name: 'Slide In Up', keyframes: '0% { transform: translateY(50px); opacity: 0; }\n100% { transform: translateY(0); opacity: 1; }' },
  { name: 'Slide In Right', keyframes: '0% { transform: translateX(-50px); opacity: 0; }\n100% { transform: translateX(0); opacity: 1; }' },
  { name: 'Scale In', keyframes: '0% { transform: scale(0.8); opacity: 0; }\n100% { transform: scale(1); opacity: 1; }' },
  { name: 'Bounce', keyframes: '0%, 100% { transform: translateY(0); }\n50% { transform: translateY(-20px); }' },
  { name: 'Pulse', keyframes: '0%, 100% { transform: scale(1); }\n50% { transform: scale(1.05); }' },
  { name: 'Rotate', keyframes: '0% { transform: rotate(0deg); }\n100% { transform: rotate(360deg); }' }
];

const easingFunctions = [
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
  'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce
  'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // anticipate
];

export default function AdvancedPanel({ config, updateConfig }) {
  const [newAnimation, setNewAnimation] = useState({
    name: '',
    keyframes: '',
    duration: 1000,
    timing: 'ease',
    iteration: 'infinite'
  });

  const animations = config.animations || [];
  const customCSS = config.custom_css || '';

  const addAnimation = () => {
    if (!newAnimation.name || !newAnimation.keyframes) {
      toast.error('Animation name and keyframes are required');
      return;
    }

    const updated = [...animations, { ...newAnimation, id: Date.now() }];
    updateConfig('animations', updated);
    setNewAnimation({ name: '', keyframes: '', duration: 1000, timing: 'ease', iteration: 'infinite' });
    toast.success('Animation added!');
  };

  const removeAnimation = (id) => {
    const updated = animations.filter(a => a.id !== id);
    updateConfig('animations', updated);
    toast.success('Animation removed');
  };

  const loadPreset = (preset) => {
    setNewAnimation(prev => ({
      ...prev,
      name: preset.name,
      keyframes: preset.keyframes
    }));
  };

  return (
    <ScrollArea className="flex-1">
      <Tabs defaultValue="css" className="w-full">
        <TabsList className="w-full grid grid-cols-2 gap-1 p-1 bg-background/50">
          <TabsTrigger value="css" className="text-xs" data-testid="css-tab">
            <Code className="w-3 h-3 mr-1" />
            Custom CSS
          </TabsTrigger>
          <TabsTrigger value="animations" className="text-xs" data-testid="animations-tab">
            Animations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="css" className="p-3 space-y-3">
          <div>
            <Label htmlFor="custom-css" className="text-xs mb-2 block">
              Custom CSS (applied globally to PWA)
            </Label>
            <Textarea
              id="custom-css"
              value={customCSS}
              onChange={(e) => updateConfig('custom_css', e.target.value)}
              placeholder=".my-class {\n  color: red;\n}\n\n#my-id {\n  background: blue;\n}"
              className="font-mono text-xs h-[400px]"
              data-testid="custom-css-input"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Write any custom CSS here. It will be injected into your PWA.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="animations" className="p-3 space-y-4">
          {/* Animation List */}
          <div>
            <Label className="text-xs mb-2 block">Defined Animations</Label>
            {animations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No animations defined</p>
            ) : (
              <div className="space-y-2">
                {animations.map((anim) => (
                  <div
                    key={anim.id}
                    className="control-section p-3"
                    data-testid={`animation-${anim.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium">{anim.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAnimation(anim.id)}
                        data-testid={`remove-animation-${anim.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>Duration: {anim.duration}ms</p>
                      <p>Timing: {anim.timing}</p>
                      <p>Iteration: {anim.iteration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Animation */}
          <div className="control-section">
            <h3 className="text-xs font-semibold text-primary mb-3">Add New Animation</h3>
            
            {/* Presets */}
            <div className="mb-3">
              <Label className="text-xs mb-2 block">Load Preset</Label>
              <div className="grid grid-cols-2 gap-1">
                {animationPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    size="sm"
                    variant="outline"
                    onClick={() => loadPreset(preset)}
                    className="text-xs h-auto py-1"
                    data-testid={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="anim-name" className="text-xs">Animation Name</Label>
                <Input
                  id="anim-name"
                  value={newAnimation.name}
                  onChange={(e) => setNewAnimation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="slideInUp"
                  className="mt-1"
                  data-testid="animation-name-input"
                />
              </div>

              <div>
                <Label htmlFor="anim-keyframes" className="text-xs">Keyframes</Label>
                <Textarea
                  id="anim-keyframes"
                  value={newAnimation.keyframes}
                  onChange={(e) => setNewAnimation(prev => ({ ...prev, keyframes: e.target.value }))}
                  placeholder="0% { transform: translateY(50px); opacity: 0; }\n100% { transform: translateY(0); opacity: 1; }"
                  className="font-mono text-xs h-[120px] mt-1"
                  data-testid="animation-keyframes-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="anim-duration" className="text-xs">Duration (ms)</Label>
                  <Input
                    id="anim-duration"
                    type="number"
                    value={newAnimation.duration}
                    onChange={(e) => setNewAnimation(prev => ({ ...prev, duration: parseInt(e.target.value) || 1000 }))}
                    className="mt-1"
                    data-testid="animation-duration-input"
                  />
                </div>

                <div>
                  <Label htmlFor="anim-iteration" className="text-xs">Iteration</Label>
                  <Select
                    value={newAnimation.iteration}
                    onValueChange={(value) => setNewAnimation(prev => ({ ...prev, iteration: value }))}
                  >
                    <SelectTrigger className="mt-1" data-testid="animation-iteration-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Once</SelectItem>
                      <SelectItem value="2">Twice</SelectItem>
                      <SelectItem value="3">3 times</SelectItem>
                      <SelectItem value="infinite">Infinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="anim-timing" className="text-xs">Timing Function</Label>
                <Select
                  value={newAnimation.timing}
                  onValueChange={(value) => setNewAnimation(prev => ({ ...prev, timing: value }))}
                >
                  <SelectTrigger className="mt-1" data-testid="animation-timing-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {easingFunctions.map((easing) => (
                      <SelectItem key={easing} value={easing}>
                        {easing.includes('cubic-bezier') ? easing.split('(')[0] + ' (custom)' : easing}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                onClick={addAnimation}
                className="w-full"
                data-testid="add-animation-btn"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Animation
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
}