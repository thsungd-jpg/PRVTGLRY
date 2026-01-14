import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

export default function PropertiesPanel({ config, updateConfig }) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {/* App Settings */}
        <div className="property-group">
          <h3 className="property-label">App Settings</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="app-name" className="text-xs">App Name</Label>
              <Input
                id="app-name"
                value={config.app_name}
                onChange={(e) => updateConfig('app_name', e.target.value)}
                className="mt-1"
                data-testid="app-name-input"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div className="property-group">
          <h3 className="property-label">Colors</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="icon-color" className="text-xs flex-1">Icon Color</Label>
              <input
                id="icon-color"
                type="color"
                value={config.icon_color}
                onChange={(e) => updateConfig('icon_color', e.target.value)}
                data-testid="icon-color-input"
              />
              <Input
                value={config.icon_color}
                onChange={(e) => updateConfig('icon_color', e.target.value)}
                className="w-24 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="text-color" className="text-xs flex-1">Text Color</Label>
              <input
                id="text-color"
                type="color"
                value={config.text_color}
                onChange={(e) => updateConfig('text_color', e.target.value)}
                data-testid="text-color-input"
              />
              <Input
                value={config.text_color}
                onChange={(e) => updateConfig('text_color', e.target.value)}
                className="w-24 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="bg-color" className="text-xs flex-1">Background</Label>
              <input
                id="bg-color"
                type="color"
                value={config.background_color}
                onChange={(e) => updateConfig('background_color', e.target.value)}
                data-testid="bg-color-input"
              />
              <Input
                value={config.background_color}
                onChange={(e) => updateConfig('background_color', e.target.value)}
                className="w-24 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Blend Modes */}
        <div className="property-group">
          <h3 className="property-label">Background Effects</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="blend-mode" className="text-xs">Blend Mode</Label>
              <Select
                value={config.background_blend_mode}
                onValueChange={(value) => updateConfig('background_blend_mode', value)}
              >
                <SelectTrigger className="mt-1" data-testid="blend-mode-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blendModes.map(mode => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="blend-preview" style={{ '--blend-mode': config.background_blend_mode }} />
          </div>
        </div>

        <Separator />

        {/* Transitions */}
        <div className="property-group">
          <h3 className="property-label">Transitions</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="duration" className="text-xs">
                Duration (ms): {config.transitions?.duration || 7000}
              </Label>
              <input
                id="duration"
                type="range"
                min="3000"
                max="20000"
                step="1000"
                value={config.transitions?.duration || 7000}
                onChange={(e) => updateConfig('transitions', {
                  ...config.transitions,
                  duration: parseInt(e.target.value)
                })}
                className="w-full mt-2"
                data-testid="duration-slider"
              />
            </div>

            <div>
              <Label htmlFor="fade-time" className="text-xs">
                Fade Time (ms): {config.transitions?.fadeTime || 3500}
              </Label>
              <input
                id="fade-time"
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={config.transitions?.fadeTime || 3500}
                onChange={(e) => updateConfig('transitions', {
                  ...config.transitions,
                  fadeTime: parseInt(e.target.value)
                })}
                className="w-full mt-2"
                data-testid="fade-time-slider"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* FX Settings */}
        <div className="property-group">
          <h3 className="property-label">Effects</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="blur-fx" className="text-xs">Blur during transition</Label>
              <Switch
                id="blur-fx"
                checked={config.fx_settings?.blur || false}
                onCheckedChange={(checked) => updateConfig('fx_settings', {
                  ...config.fx_settings,
                  blur: checked
                })}
                data-testid="blur-fx-switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="tint-fx" className="text-xs">White tint overlay</Label>
              <Switch
                id="tint-fx"
                checked={config.fx_settings?.whiteTint || false}
                onCheckedChange={(checked) => updateConfig('fx_settings', {
                  ...config.fx_settings,
                  whiteTint: checked
                })}
                data-testid="tint-fx-switch"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}