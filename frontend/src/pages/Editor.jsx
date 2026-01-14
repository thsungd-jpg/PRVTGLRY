import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Play, Settings, Sliders, Move, LayoutTemplate, FileText, MousePointer2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import axios from 'axios';
import AssetPanel from '@/components/editor/AssetPanel';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import AdvancedPanel from '@/components/editor/AdvancedPanel';
import LayoutPanel from '@/components/editor/LayoutPanel';
import TemplatesPanel from '@/components/editor/TemplatesPanel';
import PagesPanel from '@/components/editor/PagesPanel';
import ButtonAnimationsPanel from '@/components/editor/ButtonAnimationsPanel';
import PreviewCanvas from '@/components/editor/PreviewCanvas';
import InteractiveCanvas from '@/components/editor/InteractiveCanvas';
import DevicePreview from '@/components/editor/DevicePreview';
import PresetDialog from '@/components/editor/PresetDialog';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const defaultConfig = {
  app_name: 'My PWA App',
  icon_color: '#F59E0B',
  text_color: '#FFFFFF',
  background_color: '#000000',
  background_images: [],
  background_blend_mode: 'screen',
  background_blend_list: [],
  gallery_images: [],
  audio_tracks: [],
  video_tracks: [],
  pages: [{ id: 'home', title: 'Home' }],
  page_transition: {
    type: 'fade',
    duration: 500
  },
  transitions: {
    duration: 7000,
    fadeTime: 3500
  },
  fx_settings: {
    blur: false,
    whiteTint: false
  },
  glow_effects: {
    buttons: false,
    text: false,
    images: false,
    video: false,
    intensity: 20
  },
  animations: [],
  custom_css: '',
  layout: {
    snapEnabled: true,
    snapGrid: 10,
    autoSpacing: true,
    elements: []
  }
};

export default function Editor() {
  const [config, setConfig] = useState(defaultConfig);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'interactive'

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await axios.get(`${API}/presets`);
      setPresets(response.data);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreset = async (name) => {
    try {
      setLoading(true);
      await axios.post(`${API}/presets`, {
        name,
        config
      });
      toast.success('Preset saved successfully!');
      loadPresets();
      setShowPresetDialog(false);
    } catch (error) {
      toast.error('Failed to save preset');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = async (presetId) => {
    try {
      const response = await axios.get(`${API}/presets/${presetId}`);
      setConfig(response.data);
      setPreviewKey(prev => prev + 1);
      toast.success('Preset loaded successfully!');
    } catch (error) {
      toast.error('Failed to load preset');
      console.error(error);
    }
  };

  const handleDeletePreset = async (presetId) => {
    try {
      await axios.delete(`${API}/presets/${presetId}`);
      toast.success('Preset deleted');
      loadPresets();
    } catch (error) {
      toast.error('Failed to delete preset');
      console.error(error);
    }
  };

  const handleGeneratePWA = async () => {
    try {
      setLoading(true);
      toast.info('Generating PWA files...');
      
      const response = await axios.post(`${API}/generate-pwa`, config);
      const files = response.data.files;
      
      // Create ZIP file
      const zip = new JSZip();
      
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });
      
      // Add config.json for reimport
      zip.file('pwa-config.json', JSON.stringify(config, null, 2));
      
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${config.app_name.replace(/\s+/g, '-').toLowerCase()}-pwa.zip`);
      
      toast.success('PWA generated and downloaded!');
    } catch (error) {
      toast.error('Failed to generate PWA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    saveAs(blob, `${config.app_name.replace(/\s+/g, '-').toLowerCase()}-config.json`);
    toast.success('Configuration exported!');
  };

  const handleImportConfig = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setConfig(imported);
        setPreviewKey(prev => prev + 1);
        toast.success('Configuration imported!');
      } catch (error) {
        toast.error('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
    toast.success('Preview refreshed!');
  };

  const handleApplyTemplate = (layout) => {
    updateConfig('layout', layout);
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="editor-layout-new">
      {/* Top Controls Bar */}
      <div className="editor-top-controls">
        {/* App Name & Actions */}
        <div className="editor-controls-section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-primary">Project Settings</h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPresetDialog(true)}
                data-testid="save-preset-btn"
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleGeneratePWA}
                disabled={loading}
                data-testid="generate-pwa-btn"
              >
                {loading ? <span className="spinner" /> : <Download className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">App Name</Label>
            <Input
              value={config.app_name}
              onChange={(e) => updateConfig('app_name', e.target.value)}
              data-testid="app-name-input"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="editor-controls-section">
          <h3 className="text-sm font-semibold text-primary mb-3">Colors</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs flex-1">Icon</Label>
              <input
                type="color"
                value={config.icon_color}
                onChange={(e) => updateConfig('icon_color', e.target.value)}
                className="w-10 h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs flex-1">Text</Label>
              <input
                type="color"
                value={config.text_color}
                onChange={(e) => updateConfig('text_color', e.target.value)}
                className="w-10 h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs flex-1">Background</Label>
              <input
                type="color"
                value={config.background_color}
                onChange={(e) => updateConfig('background_color', e.target.value)}
                className="w-10 h-10"
              />
            </div>
          </div>
        </div>

        {/* Glow Effects */}
        <div className="editor-controls-section">
          <h3 className="text-sm font-semibold text-primary mb-3">Glow Effects</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Buttons Glow</Label>
              <Switch
                checked={config.glow_effects?.buttons || false}
                onCheckedChange={(checked) => updateConfig('glow_effects', {
                  ...config.glow_effects,
                  buttons: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Text Glow</Label>
              <Switch
                checked={config.glow_effects?.text || false}
                onCheckedChange={(checked) => updateConfig('glow_effects', {
                  ...config.glow_effects,
                  text: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Images Glow</Label>
              <Switch
                checked={config.glow_effects?.images || false}
                onCheckedChange={(checked) => updateConfig('glow_effects', {
                  ...config.glow_effects,
                  images: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Video Glow</Label>
              <Switch
                checked={config.glow_effects?.video || false}
                onCheckedChange={(checked) => updateConfig('glow_effects', {
                  ...config.glow_effects,
                  video: checked
                })}
              />
            </div>
            <div>
              <Label className="text-xs">Glow Intensity</Label>
              <input
                type="range"
                min="10"
                max="60"
                value={config.glow_effects?.intensity || 20}
                onChange={(e) => updateConfig('glow_effects', {
                  ...config.glow_effects,
                  intensity: parseInt(e.target.value)
                })}
                className="w-full mt-1"
              />
              <span className="text-xs text-muted-foreground">{config.glow_effects?.intensity || 20}px</span>
            </div>
          </div>
        </div>

        {/* Layout Controls */}
        <div className="editor-controls-section">
          <h3 className="text-sm font-semibold text-primary mb-3">Layout</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Snap to Grid</Label>
              <Switch
                checked={config.layout?.snapEnabled || false}
                onCheckedChange={(checked) => updateConfig('layout', {
                  ...config.layout,
                  snapEnabled: checked
                })}
              />
            </div>
            <div>
              <Label className="text-xs">Grid: {config.layout?.snapGrid || 10}px</Label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={config.layout?.snapGrid || 10}
                onChange={(e) => updateConfig('layout', {
                  ...config.layout,
                  snapGrid: parseInt(e.target.value)
                })}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* More sections in tabs */}
        <div className="editor-controls-section" style={{ minWidth: '350px' }}>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-3">
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
              <TabsTrigger value="pages" className="text-xs">Pages</TabsTrigger>
              <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
            </TabsList>
            <TabsContent value="templates" className="max-h-60 overflow-y-auto">
              <TemplatesPanel onApplyTemplate={handleApplyTemplate} />
            </TabsContent>
            <TabsContent value="pages" className="max-h-60 overflow-y-auto">
              <PagesPanel config={config} updateConfig={updateConfig} />
            </TabsContent>
            <TabsContent value="assets" className="max-h-60 overflow-y-auto">
              <AssetPanel 
                config={config} 
                updateConfig={updateConfig}
                presets={presets}
                onLoadPreset={handleLoadPreset}
                onDeletePreset={handleDeletePreset}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Canvas */}
      <div className="editor-canvas-container">
        <div className="canvas-header">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{config.app_name}</span>
          </div>

          <div className="flex gap-2">
            {/* Device Selector */}
            <div className="flex gap-1 border border-border rounded">
              <Button
                size="sm"
                variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setSelectedDevice('desktop')}
                className="rounded-none"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setSelectedDevice('tablet')}
                className="rounded-none"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setSelectedDevice('mobile')}
                className="rounded-none"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <Button
              size="sm"
              variant={viewMode === 'interactive' ? 'default' : 'ghost'}
              onClick={() => setViewMode(viewMode === 'preview' ? 'interactive' : 'preview')}
            >
              <Move className="w-4 h-4 mr-1" />
              {viewMode === 'interactive' ? 'Interactive' : 'Preview'}
            </Button>

            <Button size="sm" variant="ghost" onClick={refreshPreview}>
              <Play className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="canvas-workspace">
          {viewMode === 'interactive' ? (
            <InteractiveCanvas config={config} updateConfig={updateConfig} />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="device-frame" style={{ width: selectedDevice === 'mobile' ? 375 : selectedDevice === 'tablet' ? 768 : '100%', height: '100%', maxHeight: '90%' }}>
                <PreviewCanvas key={previewKey} config={config} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Dialog */}
      <PresetDialog
        open={showPresetDialog}
        onClose={() => setShowPresetDialog(false)}
        onSave={handleSavePreset}
        loading={loading}
      />
    </div>
  );
}