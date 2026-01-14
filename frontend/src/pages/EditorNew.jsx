import React, { useState, useEffect } from 'react';
import { Save, Download, Play, Settings, Layers, Palette, Sparkles, Grid3x3, Monitor, Tablet, Smartphone, Move, Menu, X, Image, Video, Music, FileText, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import axios from 'axios';
import PreviewCanvas from '@/components/editor/PreviewCanvas';
import InteractiveCanvas from '@/components/editor/InteractiveCanvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const defaultConfig = {
  app_name: 'My PWA App',
  icon_color: '#F59E0B',
  text_color: '#FFFFFF',
  background_color: '#000000',
  glow_effects: { buttons: false, text: false, images: false, video: false, intensity: 20 },
  layout: { snapEnabled: true, snapGrid: 10, autoSpacing: true, elements: [] },
  background_images: [],
  gallery_images: [],
  video_tracks: [],
  audio_tracks: [],
  pages: [{ id: 'home', title: 'Home' }],
  page_transition: { type: 'fade', duration: 500 },
  animations: [],
  custom_css: ''
};

const layoutTemplates = [
  {
    id: 'slideshow-sidebar',
    name: 'Slideshow + Sidebar',
    elements: [
      { type: 'text', x: 350, y: 100, width: 300, height: 60 },
      { type: 'image', x: 200, y: 200, width: 300, height: 250 },
      { type: 'text', x: 540, y: 200, width: 260, height: 250 },
      { type: 'audio', x: 350, y: 480, width: 300, height: 60 }
    ]
  },
  {
    id: 'video-center',
    name: 'Video Center',
    elements: [
      { type: 'text', x: 350, y: 100, width: 300, height: 60 },
      { type: 'video', x: 275, y: 200, width: 450, height: 300 },
      { type: 'audio', x: 350, y: 520, width: 300, height: 60 }
    ]
  },
  {
    id: 'gallery-grid',
    name: 'Gallery Grid',
    elements: [
      { type: 'text', x: 350, y: 100, width: 300, height: 60 },
      { type: 'image', x: 250, y: 200, width: 200, height: 150 },
      { type: 'image', x: 550, y: 200, width: 200, height: 150 },
      { type: 'image', x: 250, y: 380, width: 200, height: 150 },
      { type: 'image', x: 550, y: 380, width: 200, height: 150 }
    ]
  }
];

export default function EditorNew() {
  const [config, setConfig] = useState(defaultConfig);
  const [viewMode, setViewMode] = useState('preview');
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const applyTemplate = (template) => {
    const elements = template.elements.map(el => ({
      ...el,
      id: Date.now() + Math.random(),
      rotation: 0,
      zIndex: 0
    }));
    updateConfig('layout', { ...config.layout, elements });
    toast.success(`Template "${template.name}" applied!`);
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageData = {
        url: response.data.url,
        name: response.data.name
      };

      if (type === 'background') {
        updateConfig('background_images', [...(config.background_images || []), imageData]);
      } else {
        updateConfig('gallery_images', [...(config.gallery_images || []), imageData]);
      }

      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const videoData = {
        url: response.data.url,
        name: response.data.name,
        title: file.name.replace(/\.[^/.]+$/, '')
      };

      updateConfig('video_tracks', [...(config.video_tracks || []), videoData]);
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Failed to upload video');
    }
  };

  const handleAudioUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const audioData = {
        url: response.data.url,
        name: response.data.name,
        title: file.name.replace(/\.[^/.]+$/, '')
      };

      updateConfig('audio_tracks', [...(config.audio_tracks || []), audioData]);
      toast.success('Audio uploaded!');
    } catch (error) {
      toast.error('Failed to upload audio');
    }
  };

  const handleGeneratePWA = async () => {
    try {
      setLoading(true);
      toast.info('Generating PWA...');
      const response = await axios.post(`${API}/generate-pwa`, config);
      const zip = new JSZip();
      Object.entries(response.data.files).forEach(([path, content]) => {
        zip.file(path, content);
      });
      zip.file('pwa-config.json', JSON.stringify(config, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${config.app_name.replace(/\\s+/g, '-').toLowerCase()}-pwa.zip`);
      toast.success('PWA generated!');
    } catch (error) {
      toast.error('Failed to generate PWA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-container">
      {/* Top Navbar */}
      <div className="editor-navbar">
        <div className="flex items-center gap-3">
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <h1 className="text-sm font-bold neon-text">PWA BUILDER</h1>
        </div>
        
        <Input
          value={config.app_name}
          onChange={(e) => updateConfig('app_name', e.target.value)}
          className="compact-input w-48"
          placeholder="App Name"
        />

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="compact-btn" onClick={handleGeneratePWA} disabled={loading}>
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="editor-controls">
        {/* Colors */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="icon-btn glow-primary">
              <Palette className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-64">
            <div className="section-header">Colors</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Icon</Label>
                <input type="color" value={config.icon_color} onChange={(e) => updateConfig('icon_color', e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Text</Label>
                <input type="color" value={config.text_color} onChange={(e) => updateConfig('text_color', e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Background</Label>
                <input type="color" value={config.background_color} onChange={(e) => updateConfig('background_color', e.target.value)} />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Glow Effects */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="icon-btn pulse-glow">
              <Sparkles className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-64">
            <div className="section-header">Glow Effects</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Buttons</Label>
                <Switch
                  checked={config.glow_effects?.buttons || false}
                  onCheckedChange={(checked) => updateConfig('glow_effects', { ...config.glow_effects, buttons: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Text</Label>
                <Switch
                  checked={config.glow_effects?.text || false}
                  onCheckedChange={(checked) => updateConfig('glow_effects', { ...config.glow_effects, text: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Images</Label>
                <Switch
                  checked={config.glow_effects?.images || false}
                  onCheckedChange={(checked) => updateConfig('glow_effects', { ...config.glow_effects, images: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Video</Label>
                <Switch
                  checked={config.glow_effects?.video || false}
                  onCheckedChange={(checked) => updateConfig('glow_effects', { ...config.glow_effects, video: checked })}
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Intensity: {config.glow_effects?.intensity || 20}px</Label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={config.glow_effects?.intensity || 20}
                  onChange={(e) => updateConfig('glow_effects', { ...config.glow_effects, intensity: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Layout */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="icon-btn">
              <Grid3x3 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-64">
            <div className="section-header">Layout</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Snap to Grid</Label>
                <Switch
                  checked={config.layout?.snapEnabled || false}
                  onCheckedChange={(checked) => updateConfig('layout', { ...config.layout, snapEnabled: checked })}
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Grid: {config.layout?.snapGrid || 10}px</Label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={config.layout?.snapGrid || 10}
                  onChange={(e) => updateConfig('layout', { ...config.layout, snapGrid: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="cyber-divider" style={{ width: 1, height: 32, margin: 0 }} />

        {/* Device Selector */}
        <div className="flex gap-1">
          <button
            className={`icon-btn ${selectedDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            className={`icon-btn ${selectedDevice === 'tablet' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            className={`icon-btn ${selectedDevice === 'mobile' ? 'active' : ''}`}
            onClick={() => setSelectedDevice('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="cyber-divider" style={{ width: 1, height: 32, margin: 0 }} />

        {/* View Mode */}
        <button
          className={`icon-btn ${viewMode === 'interactive' ? 'active' : ''}`}
          onClick={() => setViewMode(viewMode === 'preview' ? 'interactive' : 'preview')}
        >
          <Move className="w-4 h-4" />
        </button>

        <Button
          size="sm"
          variant="outline"
          className="compact-btn"
          onClick={() => setPreviewKey(prev => prev + 1)}
        >
          <Play className="w-3 h-3 mr-1" />
          Refresh
        </Button>

        <div className="status-badge ml-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
          READY
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-content">
        {/* Sidebar */}
        <div className={`editor-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            <div className="section-header">
              <Layers className="w-3 h-3" />
              Elements
            </div>
            <p className="text-xs text-muted-foreground">
              {config.layout?.elements?.length || 0} elements on canvas
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div className="editor-canvas cyber-grid">
          <div className="canvas-workspace">
            {viewMode === 'interactive' ? (
              <InteractiveCanvas config={config} updateConfig={updateConfig} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="glass"
                  style={{
                    width: selectedDevice === 'mobile' ? 375 : selectedDevice === 'tablet' ? 768 : '90%',
                    height: '90%',
                    borderRadius: 12,
                    padding: 20,
                    maxWidth: '100%'
                  }}
                >
                  <PreviewCanvas key={previewKey} config={config} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner-minimal" />
        </div>
      )}
    </div>
  );
}
