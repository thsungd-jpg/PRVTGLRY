import React, { useState, useEffect, useRef } from 'react';
import { Save, Download, Play, Settings, Layers, Palette, Sparkles, Grid3x3, Monitor, Tablet, Smartphone, Move, Menu, X, Image, Video, Music, FileText, LayoutTemplate, Type } from 'lucide-react';
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
  icon_color: '#00ffc8',
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
  custom_css: '',
  text_sections: {
    title: 'My PWA App',
    header: '',
    subHeader: '',
    footer: '',
    subFooter: ''
  }
};

// Extended template library - 20+ templates
const layoutTemplates = [
  {
    id: 'slideshow-sidebar',
    name: 'Slideshow + Sidebar',
    description: 'Large slideshow with narrative text sidebar',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 60 },
      { type: 'image', label: 'Slideshow', x: 50, y: 110, width: 450, height: 350 },
      { type: 'text', label: 'Narrative', x: 520, y: 110, width: 230, height: 350 },
      { type: 'audio', label: 'Audio Player', x: 50, y: 480, width: 700, height: 60 }
    ]
  },
  {
    id: 'video-center',
    name: 'Video Center',
    description: 'Centered video with title',
    elements: [
      { type: 'title', label: 'Title', x: 100, y: 30, width: 600, height: 60 },
      { type: 'video', label: 'Video', x: 100, y: 110, width: 600, height: 380 },
      { type: 'audio', label: 'Audio', x: 100, y: 510, width: 600, height: 50 }
    ]
  },
  {
    id: 'gallery-grid',
    name: 'Gallery Grid',
    description: '2x2 image grid layout',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 50 },
      { type: 'image', label: 'Image 1', x: 50, y: 100, width: 340, height: 200 },
      { type: 'image', label: 'Image 2', x: 410, y: 100, width: 340, height: 200 },
      { type: 'image', label: 'Image 3', x: 50, y: 320, width: 340, height: 200 },
      { type: 'image', label: 'Image 4', x: 410, y: 320, width: 340, height: 200 }
    ]
  },
  {
    id: 'hero-video',
    name: 'Hero Video',
    description: 'Full-width video with overlay text',
    elements: [
      { type: 'video', label: 'Hero Video', x: 20, y: 20, width: 760, height: 450, zIndex: 0 },
      { type: 'title', label: 'Overlay Title', x: 100, y: 80, width: 600, height: 80, zIndex: 10 },
      { type: 'subHeader', label: 'Tagline', x: 100, y: 170, width: 600, height: 40, zIndex: 10 },
      { type: 'footer', label: 'Footer', x: 100, y: 490, width: 600, height: 40 }
    ]
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Work showcase layout',
    elements: [
      { type: 'title', label: 'Project Title', x: 50, y: 30, width: 700, height: 60 },
      { type: 'header', label: 'Category', x: 50, y: 100, width: 700, height: 30 },
      { type: 'image', label: 'Hero Image', x: 50, y: 150, width: 700, height: 320 },
      { type: 'text', label: 'Description', x: 50, y: 490, width: 340, height: 80 },
      { type: 'image', label: 'Detail', x: 410, y: 490, width: 340, height: 80 }
    ]
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Side-by-side video and images',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 50 },
      { type: 'video', label: 'Video', x: 50, y: 100, width: 340, height: 350 },
      { type: 'image', label: 'Image 1', x: 410, y: 100, width: 340, height: 170 },
      { type: 'image', label: 'Image 2', x: 410, y: 280, width: 340, height: 170 },
      { type: 'audio', label: 'Audio', x: 50, y: 470, width: 700, height: 50 }
    ]
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Pinterest-style staggered grid',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 50 },
      { type: 'image', label: 'Image 1', x: 50, y: 100, width: 220, height: 200 },
      { type: 'image', label: 'Image 2', x: 290, y: 100, width: 220, height: 280 },
      { type: 'image', label: 'Image 3', x: 530, y: 100, width: 220, height: 160 },
      { type: 'image', label: 'Image 4', x: 50, y: 320, width: 220, height: 160 },
      { type: 'video', label: 'Video', x: 290, y: 400, width: 460, height: 180 }
    ]
  },
  {
    id: 'dual-sidebar',
    name: 'Dual Sidebar',
    description: 'Center content with sidebars',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 50 },
      { type: 'text', label: 'Left Sidebar', x: 50, y: 100, width: 150, height: 380 },
      { type: 'video', label: 'Main Video', x: 220, y: 100, width: 360, height: 380 },
      { type: 'text', label: 'Right Sidebar', x: 600, y: 100, width: 150, height: 380 },
      { type: 'audio', label: 'Audio', x: 50, y: 500, width: 700, height: 50 }
    ]
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Editorial-style mixed content',
    elements: [
      { type: 'title', label: 'Headline', x: 50, y: 30, width: 340, height: 80 },
      { type: 'subHeader', label: 'Subtitle', x: 410, y: 30, width: 340, height: 80 },
      { type: 'image', label: 'Feature Image', x: 50, y: 130, width: 340, height: 250 },
      { type: 'text', label: 'Article Text', x: 410, y: 130, width: 340, height: 250 },
      { type: 'video', label: 'Video', x: 50, y: 400, width: 700, height: 180 }
    ]
  },
  {
    id: 'video-gallery',
    name: 'Video Gallery',
    description: 'Multiple video players',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 50 },
      { type: 'video', label: 'Video 1', x: 50, y: 100, width: 340, height: 200 },
      { type: 'video', label: 'Video 2', x: 410, y: 100, width: 340, height: 200 },
      { type: 'video', label: 'Video 3', x: 50, y: 320, width: 340, height: 200 },
      { type: 'video', label: 'Video 4', x: 410, y: 320, width: 340, height: 200 }
    ]
  },
  {
    id: 'stacked-media',
    name: 'Stacked Media',
    description: 'Vertical media stack',
    elements: [
      { type: 'title', label: 'Title', x: 100, y: 30, width: 600, height: 50 },
      { type: 'image', label: 'Image', x: 100, y: 100, width: 600, height: 180 },
      { type: 'video', label: 'Video', x: 100, y: 300, width: 600, height: 200 },
      { type: 'footer', label: 'Footer', x: 100, y: 520, width: 600, height: 40 }
    ]
  },
  {
    id: 'asymmetric',
    name: 'Asymmetric',
    description: 'Dynamic asymmetric layout',
    elements: [
      { type: 'title', label: 'Title', x: 50, y: 30, width: 700, height: 50 },
      { type: 'video', label: 'Main Video', x: 50, y: 100, width: 420, height: 300 },
      { type: 'image', label: 'Image 1', x: 490, y: 100, width: 260, height: 145 },
      { type: 'image', label: 'Image 2', x: 490, y: 255, width: 260, height: 145 },
      { type: 'text', label: 'Content', x: 50, y: 420, width: 700, height: 100 }
    ]
  },
  {
    id: 'mobile-first',
    name: 'Mobile-First',
    description: 'Optimized for mobile/portrait',
    elements: [
      { type: 'title', label: 'Title', x: 150, y: 30, width: 500, height: 50 },
      { type: 'video', label: 'Video', x: 150, y: 100, width: 500, height: 300 },
      { type: 'text', label: 'Description', x: 150, y: 420, width: 500, height: 80 },
      { type: 'audio', label: 'Audio', x: 150, y: 520, width: 500, height: 50 }
    ]
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Marketing landing page style',
    elements: [
      { type: 'title', label: 'Hero Title', x: 100, y: 50, width: 600, height: 80 },
      { type: 'subHeader', label: 'Tagline', x: 150, y: 140, width: 500, height: 40 },
      { type: 'image', label: 'Hero Image', x: 150, y: 200, width: 500, height: 280 },
      { type: 'footer', label: 'CTA', x: 200, y: 500, width: 400, height: 50 }
    ]
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Article/blog style layout',
    elements: [
      { type: 'title', label: 'Article Title', x: 80, y: 30, width: 640, height: 60 },
      { type: 'header', label: 'Author / Date', x: 80, y: 100, width: 640, height: 30 },
      { type: 'image', label: 'Featured Image', x: 80, y: 150, width: 640, height: 250 },
      { type: 'text', label: 'Article Body', x: 80, y: 420, width: 640, height: 140 }
    ]
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'Audio-focused layout',
    elements: [
      { type: 'title', label: 'Track Title', x: 100, y: 50, width: 600, height: 60 },
      { type: 'header', label: 'Artist', x: 100, y: 120, width: 600, height: 40 },
      { type: 'image', label: 'Album Art', x: 200, y: 180, width: 400, height: 250 },
      { type: 'audio', label: 'Audio Player', x: 100, y: 450, width: 600, height: 60 },
      { type: 'footer', label: 'Playlist', x: 100, y: 530, width: 600, height: 40 }
    ]
  },
  {
    id: 'photo-story',
    name: 'Photo Story',
    description: 'Visual storytelling layout',
    elements: [
      { type: 'image', label: 'Hero Photo', x: 20, y: 20, width: 760, height: 350 },
      { type: 'title', label: 'Story Title', x: 50, y: 390, width: 500, height: 50 },
      { type: 'text', label: 'Caption', x: 50, y: 450, width: 500, height: 60 },
      { type: 'image', label: 'Photo 2', x: 570, y: 390, width: 200, height: 120 }
    ]
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'E-commerce product display',
    elements: [
      { type: 'image', label: 'Product Image', x: 50, y: 30, width: 350, height: 400 },
      { type: 'title', label: 'Product Name', x: 420, y: 30, width: 330, height: 60 },
      { type: 'header', label: 'Price', x: 420, y: 100, width: 330, height: 40 },
      { type: 'text', label: 'Description', x: 420, y: 160, width: 330, height: 200 },
      { type: 'footer', label: 'Buy Button', x: 420, y: 380, width: 330, height: 50 }
    ]
  },
  {
    id: 'event-promo',
    name: 'Event Promo',
    description: 'Event promotion layout',
    elements: [
      { type: 'title', label: 'Event Name', x: 50, y: 50, width: 700, height: 80 },
      { type: 'header', label: 'Date & Time', x: 50, y: 140, width: 700, height: 40 },
      { type: 'video', label: 'Promo Video', x: 50, y: 200, width: 450, height: 280 },
      { type: 'text', label: 'Details', x: 520, y: 200, width: 230, height: 200 },
      { type: 'footer', label: 'Register', x: 520, y: 420, width: 230, height: 60 }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean minimal design',
    elements: [
      { type: 'title', label: 'Title', x: 200, y: 100, width: 400, height: 80 },
      { type: 'subHeader', label: 'Subtitle', x: 200, y: 200, width: 400, height: 40 },
      { type: 'image', label: 'Image', x: 250, y: 280, width: 300, height: 200 },
      { type: 'footer', label: 'Footer', x: 200, y: 510, width: 400, height: 40 }
    ]
  },
  {
    id: 'full-bleed',
    name: 'Full Bleed',
    description: 'Edge-to-edge media',
    elements: [
      { type: 'video', label: 'Full Video', x: 0, y: 0, width: 800, height: 560, zIndex: 0 },
      { type: 'title', label: 'Overlay Title', x: 50, y: 200, width: 700, height: 80, zIndex: 10 },
      { type: 'subHeader', label: 'Overlay Subtitle', x: 50, y: 300, width: 700, height: 40, zIndex: 10 }
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
  const canvasRef = useRef(null);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateTextSection = (section, value) => {
    setConfig(prev => ({
      ...prev,
      text_sections: {
        ...prev.text_sections,
        [section]: value
      }
    }));
  };

  // Center elements on canvas
  const centerElements = (elements) => {
    if (elements.length === 0) return elements;
    
    // Get canvas dimensions (approximate for centering)
    const canvasWidth = 800;
    const canvasHeight = 560;
    
    // Calculate bounding box of all elements
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + el.width);
      minY = Math.min(minY, el.y);
      maxY = Math.max(maxY, el.y + el.height);
    });
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate offset to center
    const offsetX = (canvasWidth - contentWidth) / 2 - minX;
    const offsetY = (canvasHeight - contentHeight) / 2 - minY;
    
    // Apply offset to all elements
    return elements.map(el => ({
      ...el,
      x: Math.round(el.x + offsetX),
      y: Math.round(el.y + offsetY)
    }));
  };

  const applyTemplate = (template) => {
    let elements = template.elements.map(el => ({
      ...el,
      id: Date.now() + Math.random(),
      rotation: 0,
      zIndex: el.zIndex || 0
    }));
    
    // Center the elements
    elements = centerElements(elements);
    
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
          <h1 className="text-sm font-bold neon-text tracking-wider">PRVT BLDR</h1>
        </div>
        
        <Input
          value={config.app_name}
          onChange={(e) => {
            updateConfig('app_name', e.target.value);
            updateTextSection('title', e.target.value);
          }}
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

        {/* Text Sections */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="icon-btn">
              <Type className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-72">
            <div className="section-header">Text Sections</div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Title</Label>
                <Input 
                  value={config.text_sections?.title || ''} 
                  onChange={(e) => updateTextSection('title', e.target.value)}
                  className="compact-input w-full"
                  placeholder="Main title"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Header</Label>
                <Input 
                  value={config.text_sections?.header || ''} 
                  onChange={(e) => updateTextSection('header', e.target.value)}
                  className="compact-input w-full"
                  placeholder="Header text"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Sub Header</Label>
                <Input 
                  value={config.text_sections?.subHeader || ''} 
                  onChange={(e) => updateTextSection('subHeader', e.target.value)}
                  className="compact-input w-full"
                  placeholder="Sub header text"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Footer</Label>
                <Input 
                  value={config.text_sections?.footer || ''} 
                  onChange={(e) => updateTextSection('footer', e.target.value)}
                  className="compact-input w-full"
                  placeholder="Footer text"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Sub Footer</Label>
                <Input 
                  value={config.text_sections?.subFooter || ''} 
                  onChange={(e) => updateTextSection('subFooter', e.target.value)}
                  className="compact-input w-full"
                  placeholder="Sub footer text"
                />
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
          title={viewMode === 'preview' ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
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
          <span className="w-2 h-2 bg-[#00ffc8] rounded-full mr-1 animate-pulse" />
          {viewMode === 'interactive' ? 'EDIT MODE' : 'PREVIEW'}
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-content">
        {/* Sidebar */}
        <div className={`editor-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-3 bg-transparent border border-[#00ffc8]/20">
                <TabsTrigger value="templates" className="text-xs data-[state=active]:bg-[#00ffc8]/20">
                  <LayoutTemplate className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="images" className="text-xs data-[state=active]:bg-[#00ffc8]/20">
                  <Image className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="video" className="text-xs data-[state=active]:bg-[#00ffc8]/20">
                  <Video className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="audio" className="text-xs data-[state=active]:bg-[#00ffc8]/20">
                  <Music className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-2 mt-0">
                <div className="section-header">
                  <LayoutTemplate className="w-3 h-3" />
                  Templates ({layoutTemplates.length})
                </div>
                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                  {layoutTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="list-item"
                      onClick={() => applyTemplate(template)}
                      data-testid={`template-${template.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium block">{template.name}</span>
                          <span className="text-[10px] text-[#00c8ff]/60">{template.description}</span>
                        </div>
                        <span className="text-xs text-[#00ffc8]/60">{template.elements.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-2 mt-0">
                <div className="section-header">
                  <Image className="w-3 h-3" />
                  Images
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'background')}
                  className="hidden"
                  id="bg-upload"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full compact-btn"
                  onClick={() => document.getElementById('bg-upload').click()}
                >
                  Upload Background
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'gallery')}
                  className="hidden"
                  id="gallery-upload"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full compact-btn"
                  onClick={() => document.getElementById('gallery-upload').click()}
                >
                  Upload Gallery Image
                </Button>
                <div className="space-y-1 mt-3">
                  {(config.background_images || []).map((img, idx) => (
                    <div key={idx} className="list-item">
                      <span className="text-xs truncate">{img.name}</span>
                    </div>
                  ))}
                  {(config.gallery_images || []).map((img, idx) => (
                    <div key={idx} className="list-item">
                      <span className="text-xs truncate">{img.name}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-2 mt-0">
                <div className="section-header">
                  <Video className="w-3 h-3" />
                  Videos
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full compact-btn"
                  onClick={() => document.getElementById('video-upload').click()}
                >
                  Upload Video
                </Button>
                <div className="space-y-1 mt-3">
                  {(config.video_tracks || []).map((video, idx) => (
                    <div key={idx} className="list-item">
                      <div className="flex items-center gap-2">
                        <Video className="w-3 h-3 text-[#00ffc8] flex-shrink-0" />
                        <span className="text-xs truncate">{video.title}</span>
                      </div>
                    </div>
                  ))}
                  {(config.video_tracks || []).length > 1 && (
                    <div className="status-badge mt-2">
                      Playlist Enabled
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-2 mt-0">
                <div className="section-header">
                  <Music className="w-3 h-3" />
                  Audio
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full compact-btn"
                  onClick={() => document.getElementById('audio-upload').click()}
                >
                  Upload Audio
                </Button>
                <div className="space-y-1 mt-3">
                  {(config.audio_tracks || []).map((audio, idx) => (
                    <div key={idx} className="list-item">
                      <div className="flex items-center gap-2">
                        <Music className="w-3 h-3 text-[#00ffc8] flex-shrink-0" />
                        <span className="text-xs truncate">{audio.title}</span>
                      </div>
                    </div>
                  ))}
                  {(config.audio_tracks || []).length > 1 && (
                    <div className="status-badge mt-2">
                      Playlist Enabled
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="cyber-divider" />
            
            <div className="section-header">
              <Layers className="w-3 h-3" />
              Elements on Canvas
            </div>
            <p className="text-xs text-muted-foreground">
              {config.layout?.elements?.length || 0} elements
            </p>
            {(config.layout?.elements || []).map((el, idx) => (
              <div key={el.id} className="list-item mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{el.label || el.type}</span>
                  <span className="text-xs text-[#00c8ff]/60">
                    {Math.round(el.x)}, {Math.round(el.y)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="editor-canvas cyber-grid" ref={canvasRef}>
          <div className="canvas-workspace">
            {viewMode === 'interactive' ? (
              <div className="w-full h-full p-4">
                <InteractiveCanvas config={config} updateConfig={updateConfig} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div
                  className="glass"
                  style={{
                    width: selectedDevice === 'mobile' ? 'min(375px, 90%)' : selectedDevice === 'tablet' ? 'min(768px, 85%)' : '90%',
                    height: selectedDevice === 'mobile' ? 'min(667px, 85%)' : selectedDevice === 'tablet' ? 'min(1024px, 85%)' : '85%',
                    borderRadius: 12,
                    padding: selectedDevice === 'mobile' ? 12 : 20,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <PreviewCanvas key={previewKey} config={config} />
                  </div>
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
