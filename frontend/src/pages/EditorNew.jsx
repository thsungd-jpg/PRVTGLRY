import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Download, Play, Layers, Palette, Sparkles, Grid3x3, Monitor, Tablet, Smartphone, Move, Menu, X, Image, Video, Music, Type, FolderOpen, Plus, Trash2, Edit2, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import PreviewCanvas from '@/components/editor/PreviewCanvas';
import InteractiveCanvas from '@/components/editor/InteractiveCanvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Device presets
const devicePresets = {
  // iPhones
  'iphone-se-2016': { name: 'iPhone SE (2016)', width: 320, height: 568 },
  'iphone-se-2022': { name: 'iPhone SE (2022)', width: 375, height: 667 },
  'iphone-xr': { name: 'iPhone XR', width: 414, height: 896 },
  'iphone-12-pro': { name: 'iPhone 12 Pro', width: 390, height: 844 },
  'iphone-14-pro-max': { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  'iphone-4': { name: 'iPhone 4', width: 320, height: 480 },
  'iphone-5': { name: 'iPhone 5', width: 320, height: 568 },
  'iphone-6-7': { name: 'iPhone 6/7', width: 375, height: 667 },
  // Pixels
  'pixel-3-xl': { name: 'Pixel 3 XL', width: 412, height: 846 },
  'pixel-7': { name: 'Pixel 7', width: 412, height: 915 },
  'pixel-2': { name: 'Pixel 2', width: 412, height: 732 },
  'pixel-2-xl': { name: 'Pixel 2 XL', width: 412, height: 824 },
  // Galaxy
  'galaxy-s8': { name: 'Galaxy S8+', width: 360, height: 740 },
  'galaxy-s20': { name: 'Galaxy S20 Ultra', width: 412, height: 915 },
  'galaxy-s5': { name: 'Galaxy S5', width: 360, height: 640 },
  'galaxy-a51': { name: 'Galaxy A51', width: 412, height: 915 },
  'galaxy-z-fold-inner': { name: 'Galaxy Z Fold 5 (Inner)', width: 384, height: 832 },
  'galaxy-z-fold-cover': { name: 'Galaxy Z Fold 5 (Cover)', width: 904, height: 2316 },
  // iPads
  'ipad-mini-5': { name: 'iPad Mini (5th)', width: 768, height: 1024 },
  'ipad-mini-6': { name: 'iPad Mini (6th)', width: 744, height: 1133 },
  'ipad-air': { name: 'iPad Air', width: 820, height: 1180 },
  'ipad-pro-12': { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
  'ipad-pro-11': { name: 'iPad Pro 11"', width: 834, height: 1194 },
  // Surface
  'surface-pro': { name: 'Surface Pro 7', width: 1368, height: 912 },
  'surface-duo': { name: 'Surface Duo', width: 720, height: 1114 },
  'surface-duo-both': { name: 'Surface Duo (Both)', width: 1440, height: 1114 },
  // Other
  'zenbook-fold': { name: 'Zenbook Fold', width: 2560, height: 1920 },
  'zenbook-fold-folded': { name: 'Zenbook Fold (Folded)', width: 1920, height: 1280 },
  'nest-hub': { name: 'Nest Hub', width: 1024, height: 600 },
  'nest-hub-max': { name: 'Nest Hub Max', width: 1280, height: 800 },
  // Desktop
  'desktop': { name: 'Desktop', width: 1920, height: 1080 },
  'laptop': { name: 'Laptop', width: 1366, height: 768 },
};

// Player frame styles
const playerFrameStyles = {
  minimal: { name: 'Minimal', borderRadius: 4, border: 'none', shadow: 'none', bg: 'transparent' },
  rounded: { name: 'Rounded', borderRadius: 16, border: '2px solid rgba(0,255,200,0.3)', shadow: '0 4px 20px rgba(0,0,0,0.3)', bg: 'rgba(0,0,0,0.3)' },
  glassmorphism: { name: 'Glassmorphism', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)', shadow: '0 8px 32px rgba(0,0,0,0.4)', bg: 'rgba(255,255,255,0.1)', backdrop: 'blur(10px)' },
  neon: { name: 'Neon', borderRadius: 8, border: '2px solid #00ffc8', shadow: '0 0 20px rgba(0,255,200,0.4), inset 0 0 20px rgba(0,255,200,0.1)', bg: 'rgba(0,0,0,0.5)' },
  retro: { name: 'Retro', borderRadius: 0, border: '4px solid #00c8ff', shadow: '4px 4px 0 #00ffc8', bg: '#0a0a0a' },
};

// Slideshow transition types
const slideshowTransitions = [
  { id: 'fade', name: 'Fade' },
  { id: 'slide-left', name: 'Slide Left' },
  { id: 'slide-right', name: 'Slide Right' },
  { id: 'slide-up', name: 'Slide Up' },
  { id: 'slide-down', name: 'Slide Down' },
  { id: 'zoom-in', name: 'Zoom In' },
  { id: 'zoom-out', name: 'Zoom Out' },
  { id: 'flip', name: 'Flip' },
  { id: 'rotate', name: 'Rotate' },
];

// Page transition types
const pageTransitions = [
  { id: 'fade', name: 'Fade' },
  { id: 'slide-left', name: 'Slide Left' },
  { id: 'slide-right', name: 'Slide Right' },
  { id: 'slide-up', name: 'Slide Up' },
  { id: 'slide-down', name: 'Slide Down' },
  { id: 'scale', name: 'Scale' },
  { id: 'flip-x', name: 'Flip X' },
  { id: 'flip-y', name: 'Flip Y' },
];

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
  pages: [{ id: 'home', title: 'Home', elements: [] }],
  currentPageId: 'home',
  page_transition: { type: 'fade', duration: 300 },
  page_navigation: { swipeEnabled: true, clickEnabled: true },
  slideshow_settings: { transition: 'fade', duration: 5000, autoPlay: true, loop: true },
  player_frame: 'glassmorphism',
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

// Extended template library
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
  },
  {
    id: 'podcast',
    name: 'Podcast',
    description: 'Podcast episode layout',
    elements: [
      { type: 'image', label: 'Cover Art', x: 50, y: 50, width: 300, height: 300 },
      { type: 'title', label: 'Episode Title', x: 380, y: 50, width: 370, height: 60 },
      { type: 'header', label: 'Show Name', x: 380, y: 120, width: 370, height: 40 },
      { type: 'text', label: 'Description', x: 380, y: 180, width: 370, height: 170 },
      { type: 'audio', label: 'Audio Player', x: 50, y: 380, width: 700, height: 80 },
      { type: 'footer', label: 'Links', x: 50, y: 480, width: 700, height: 40 }
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Data dashboard layout',
    elements: [
      { type: 'title', label: 'Dashboard Title', x: 50, y: 20, width: 700, height: 50 },
      { type: 'image', label: 'Chart 1', x: 50, y: 90, width: 340, height: 180 },
      { type: 'image', label: 'Chart 2', x: 410, y: 90, width: 340, height: 180 },
      { type: 'image', label: 'Chart 3', x: 50, y: 290, width: 220, height: 150 },
      { type: 'image', label: 'Chart 4', x: 290, y: 290, width: 220, height: 150 },
      { type: 'image', label: 'Chart 5', x: 530, y: 290, width: 220, height: 150 },
      { type: 'text', label: 'Summary', x: 50, y: 460, width: 700, height: 80 }
    ]
  },
];

export default function EditorNew() {
  const [config, setConfig] = useState(defaultConfig);
  const [viewMode, setViewMode] = useState('preview');
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [savedPresets, setSavedPresets] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingElement, setEditingElement] = useState(null);
  const [showElementEditor, setShowElementEditor] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [showPagesPanel, setShowPagesPanel] = useState(false);
  const [showSlideshowSettings, setShowSlideshowSettings] = useState(false);
  const [renameDialog, setRenameDialog] = useState({ open: false, type: '', index: -1, value: '' });
  const canvasRef = useRef(null);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const response = await axios.get(`${API}/presets`);
      setSavedPresets(response.data);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

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
  const centerElements = (elements, canvasWidth = 800, canvasHeight = 560) => {
    if (elements.length === 0) return elements;
    
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
    
    // Scale down if content is too large
    let scale = 1;
    const padding = 40;
    if (contentWidth > canvasWidth - padding) {
      scale = Math.min(scale, (canvasWidth - padding) / contentWidth);
    }
    if (contentHeight > canvasHeight - padding) {
      scale = Math.min(scale, (canvasHeight - padding) / contentHeight);
    }
    
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;
    
    const offsetX = (canvasWidth - scaledWidth) / 2 - minX * scale;
    const offsetY = (canvasHeight - scaledHeight) / 2 - minY * scale;
    
    return elements.map(el => ({
      ...el,
      x: Math.round(el.x * scale + offsetX),
      y: Math.round(el.y * scale + offsetY),
      width: Math.round(el.width * scale),
      height: Math.round(el.height * scale)
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

  // Add uploaded media to canvas
  const addMediaToCanvas = (type, mediaData) => {
    const currentElements = config.layout?.elements || [];
    const canvasWidth = 800;
    const canvasHeight = 560;
    
    let width, height;
    switch (type) {
      case 'image':
        width = 300;
        height = 200;
        break;
      case 'video':
        width = 400;
        height: 250;
        break;
      case 'audio':
        width = 400;
        height = 60;
        break;
      default:
        width = 200;
        height = 100;
    }
    
    const newElement = {
      id: Date.now() + Math.random(),
      type,
      label: mediaData.name || `${type} ${currentElements.length + 1}`,
      x: (canvasWidth - width) / 2,
      y: (canvasHeight - height) / 2,
      width,
      height,
      rotation: 0,
      zIndex: currentElements.length,
      mediaUrl: mediaData.url,
      mediaName: mediaData.name
    };
    
    updateConfig('layout', {
      ...config.layout,
      elements: [...currentElements, newElement]
    });
    
    toast.success(`${type} added to canvas!`);
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API}/upload/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageData = {
        id: Date.now() + Math.random(),
        url: response.data.url,
        name: file.name.replace(/\.[^/.]+$/, '')
      };

      if (type === 'background') {
        updateConfig('background_images', [...(config.background_images || []), imageData]);
        toast.success('Background image uploaded!');
      } else {
        updateConfig('gallery_images', [...(config.gallery_images || []), imageData]);
        addMediaToCanvas('image', imageData);
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API}/upload/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const videoData = {
        id: Date.now() + Math.random(),
        url: response.data.url,
        name: response.data.name,
        title: file.name.replace(/\.[^/.]+$/, '')
      };

      updateConfig('video_tracks', [...(config.video_tracks || []), videoData]);
      addMediaToCanvas('video', videoData);
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API}/upload/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const audioData = {
        id: Date.now() + Math.random(),
        url: response.data.url,
        name: response.data.name,
        title: file.name.replace(/\.[^/.]+$/, '')
      };

      updateConfig('audio_tracks', [...(config.audio_tracks || []), audioData]);
      addMediaToCanvas('audio', audioData);
    } catch (error) {
      toast.error('Failed to upload audio');
    } finally {
      setLoading(false);
    }
  };

  // Save project
  const handleSaveProject = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/presets`, {
        name: presetName,
        config: { ...config, app_name: presetName }
      });
      toast.success('Project saved!');
      setShowSaveDialog(false);
      setPresetName('');
      loadPresets();
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  // Load project
  const handleLoadProject = async (preset) => {
    setConfig({
      ...defaultConfig,
      ...preset,
      ...preset.config
    });
    setShowLoadDialog(false);
    toast.success(`Loaded "${preset.name}"`);
  };

  // Delete project
  const handleDeleteProject = async (presetId) => {
    try {
      await axios.delete(`${API}/presets/${presetId}`);
      toast.success('Project deleted');
      loadPresets();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  // Handle element double-click in sidebar
  const handleElementDoubleClick = (element) => {
    setEditingElement(element);
    setShowElementEditor(true);
  };

  // Update element properties
  const updateElement = (elementId, updates) => {
    const elements = config.layout?.elements || [];
    const updatedElements = elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateConfig('layout', { ...config.layout, elements: updatedElements });
  };

  // Add new page
  const addPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      title: `Page ${(config.pages?.length || 0) + 1}`,
      elements: []
    };
    updateConfig('pages', [...(config.pages || []), newPage]);
    toast.success('Page added!');
  };

  // Delete page
  const deletePage = (pageId) => {
    if ((config.pages?.length || 0) <= 1) {
      toast.error('Cannot delete the last page');
      return;
    }
    const newPages = config.pages.filter(p => p.id !== pageId);
    updateConfig('pages', newPages);
    if (config.currentPageId === pageId) {
      updateConfig('currentPageId', newPages[0]?.id);
    }
    toast.success('Page deleted');
  };

  // Rename item
  const handleRename = (type, index, newName) => {
    if (!newName.trim()) return;
    
    switch (type) {
      case 'page':
        const pages = [...config.pages];
        pages[index] = { ...pages[index], title: newName };
        updateConfig('pages', pages);
        break;
      case 'video':
        const videos = [...config.video_tracks];
        videos[index] = { ...videos[index], title: newName };
        updateConfig('video_tracks', videos);
        break;
      case 'audio':
        const audios = [...config.audio_tracks];
        audios[index] = { ...audios[index], title: newName };
        updateConfig('audio_tracks', audios);
        break;
      case 'image':
        const images = [...config.gallery_images];
        images[index] = { ...images[index], name: newName };
        updateConfig('gallery_images', images);
        break;
    }
    setRenameDialog({ open: false, type: '', index: -1, value: '' });
    toast.success('Renamed successfully');
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

  // Get device dimensions
  const getDeviceDimensions = () => {
    const preset = devicePresets[selectedDevice];
    if (!preset) return { width: '100%', height: '100%' };
    
    // Scale down to fit in canvas area
    const maxWidth = window.innerWidth - 400;
    const maxHeight = window.innerHeight - 200;
    
    let scale = 1;
    if (preset.width > maxWidth) scale = maxWidth / preset.width;
    if (preset.height * scale > maxHeight) scale = maxHeight / preset.height;
    
    return {
      width: Math.round(preset.width * scale),
      height: Math.round(preset.height * scale),
      actualWidth: preset.width,
      actualHeight: preset.height
    };
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
          <Button size="sm" variant="outline" className="compact-btn" onClick={() => setShowSaveDialog(true)}>
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" className="compact-btn" onClick={() => setShowLoadDialog(true)}>
            <FolderOpen className="w-3 h-3 mr-1" />
            Open
          </Button>
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
              {['title', 'header', 'subHeader', 'footer', 'subFooter'].map((section) => (
                <div key={section}>
                  <Label className="text-xs mb-1 block capitalize">{section.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input 
                    value={config.text_sections?.[section] || ''} 
                    onChange={(e) => updateTextSection(section, e.target.value)}
                    className="compact-input w-full"
                    placeholder={`${section} text`}
                  />
                </div>
              ))}
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
              {['buttons', 'text', 'images', 'video'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <Label className="text-xs capitalize">{item}</Label>
                  <Switch
                    checked={config.glow_effects?.[item] || false}
                    onCheckedChange={(checked) => updateConfig('glow_effects', { ...config.glow_effects, [item]: checked })}
                  />
                </div>
              ))}
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
            <div className="cyber-divider" />
            <div className="section-header">Player Frame Style</div>
            <Select value={config.player_frame} onValueChange={(value) => updateConfig('player_frame', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(playerFrameStyles).map(([key, style]) => (
                  <SelectItem key={key} value={key}>{style.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>

        {/* Pages */}
        <Popover open={showPagesPanel} onOpenChange={setShowPagesPanel}>
          <PopoverTrigger asChild>
            <button className="icon-btn">
              <Layers className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-80">
            <div className="section-header">Pages & Transitions</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(config.pages || []).map((page, idx) => (
                <div key={page.id} className="flex items-center gap-2 p-2 bg-black/30 rounded">
                  <span className="text-xs flex-1">{page.title}</span>
                  <button 
                    className="icon-btn w-6 h-6"
                    onClick={() => setRenameDialog({ open: true, type: 'page', index: idx, value: page.title })}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    className="icon-btn w-6 h-6 hover:bg-red-500/20"
                    onClick={() => deletePage(page.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="w-full mt-2 compact-btn" onClick={addPage}>
              <Plus className="w-3 h-3 mr-1" /> Add Page
            </Button>
            
            <div className="cyber-divider" />
            <div className="section-header">Page Transition</div>
            <Select 
              value={config.page_transition?.type || 'fade'} 
              onValueChange={(value) => updateConfig('page_transition', { ...config.page_transition, type: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageTransitions.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2">
              <Label className="text-xs">Duration: {config.page_transition?.duration || 300}ms</Label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={config.page_transition?.duration || 300}
                onChange={(e) => updateConfig('page_transition', { ...config.page_transition, duration: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div className="cyber-divider" />
            <div className="section-header">Navigation Options</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Swipe Navigation</Label>
                <Switch
                  checked={config.page_navigation?.swipeEnabled ?? true}
                  onCheckedChange={(checked) => updateConfig('page_navigation', { ...config.page_navigation, swipeEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Click Navigation</Label>
                <Switch
                  checked={config.page_navigation?.clickEnabled ?? true}
                  onCheckedChange={(checked) => updateConfig('page_navigation', { ...config.page_navigation, clickEnabled: checked })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Slideshow Settings */}
        <Popover open={showSlideshowSettings} onOpenChange={setShowSlideshowSettings}>
          <PopoverTrigger asChild>
            <button className="icon-btn">
              <Settings2 className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-72">
            <div className="section-header">Slideshow Settings</div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Transition Effect</Label>
                <Select 
                  value={config.slideshow_settings?.transition || 'fade'} 
                  onValueChange={(value) => updateConfig('slideshow_settings', { ...config.slideshow_settings, transition: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {slideshowTransitions.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Duration: {(config.slideshow_settings?.duration || 5000) / 1000}s</Label>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={config.slideshow_settings?.duration || 5000}
                  onChange={(e) => updateConfig('slideshow_settings', { ...config.slideshow_settings, duration: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Auto Play</Label>
                <Switch
                  checked={config.slideshow_settings?.autoPlay ?? true}
                  onCheckedChange={(checked) => updateConfig('slideshow_settings', { ...config.slideshow_settings, autoPlay: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Loop</Label>
                <Switch
                  checked={config.slideshow_settings?.loop ?? true}
                  onCheckedChange={(checked) => updateConfig('slideshow_settings', { ...config.slideshow_settings, loop: checked })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="cyber-divider" style={{ width: 1, height: 32, margin: 0 }} />

        {/* Device Selector */}
        <Popover open={showDeviceSelector} onOpenChange={setShowDeviceSelector}>
          <PopoverTrigger asChild>
            <button className="icon-btn flex items-center gap-1 w-auto px-2">
              <Monitor className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="popover-panel w-72 max-h-96 overflow-y-auto">
            <div className="section-header">Device Preview</div>
            {Object.entries(
              Object.entries(devicePresets).reduce((acc, [key, val]) => {
                const category = key.includes('iphone') ? 'iPhone' :
                               key.includes('ipad') ? 'iPad' :
                               key.includes('pixel') ? 'Pixel' :
                               key.includes('galaxy') ? 'Galaxy' :
                               key.includes('surface') ? 'Surface' :
                               key.includes('nest') ? 'Nest' : 'Other';
                if (!acc[category]) acc[category] = [];
                acc[category].push([key, val]);
                return acc;
              }, {})
            ).map(([category, devices]) => (
              <div key={category} className="mb-3">
                <div className="text-xs text-[#00ffc8]/60 uppercase mb-1">{category}</div>
                {devices.map(([key, device]) => (
                  <button
                    key={key}
                    className={`w-full text-left px-2 py-1 text-xs rounded mb-1 transition-colors ${
                      selectedDevice === key ? 'bg-[#00ffc8]/20 text-[#00ffc8]' : 'hover:bg-white/5'
                    }`}
                    onClick={() => { setSelectedDevice(key); setShowDeviceSelector(false); }}
                  >
                    {device.name} <span className="text-[#00c8ff]/50">({device.width}×{device.height})</span>
                  </button>
                ))}
              </div>
            ))}
          </PopoverContent>
        </Popover>

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
                  <Layers className="w-3 h-3" />
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
                  Templates ({layoutTemplates.length})
                </div>
                <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
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
                <div className="section-header">Images</div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} className="hidden" id="bg-upload" />
                <Button size="sm" variant="outline" className="w-full compact-btn" onClick={() => document.getElementById('bg-upload').click()}>
                  Upload Background
                </Button>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} className="hidden" id="gallery-upload" />
                <Button size="sm" variant="outline" className="w-full compact-btn" onClick={() => document.getElementById('gallery-upload').click()}>
                  Upload Image
                </Button>
                <div className="space-y-1 mt-3">
                  {(config.gallery_images || []).map((img, idx) => (
                    <div key={idx} className="list-item flex items-center justify-between">
                      <span className="text-xs truncate flex-1">{img.name}</span>
                      <button 
                        className="icon-btn w-5 h-5"
                        onClick={(e) => { e.stopPropagation(); setRenameDialog({ open: true, type: 'image', index: idx, value: img.name }); }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-2 mt-0">
                <div className="section-header">Videos</div>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="video-upload" />
                <Button size="sm" variant="outline" className="w-full compact-btn" onClick={() => document.getElementById('video-upload').click()}>
                  Upload Video
                </Button>
                <div className="space-y-1 mt-3">
                  {(config.video_tracks || []).map((video, idx) => (
                    <div key={idx} className="list-item flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Video className="w-3 h-3 text-[#00ffc8] flex-shrink-0" />
                        <span className="text-xs truncate">{video.title}</span>
                      </div>
                      <button 
                        className="icon-btn w-5 h-5"
                        onClick={(e) => { e.stopPropagation(); setRenameDialog({ open: true, type: 'video', index: idx, value: video.title }); }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-2 mt-0">
                <div className="section-header">Audio</div>
                <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" />
                <Button size="sm" variant="outline" className="w-full compact-btn" onClick={() => document.getElementById('audio-upload').click()}>
                  Upload Audio
                </Button>
                <div className="space-y-1 mt-3">
                  {(config.audio_tracks || []).map((audio, idx) => (
                    <div key={idx} className="list-item flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Music className="w-3 h-3 text-[#00ffc8] flex-shrink-0" />
                        <span className="text-xs truncate">{audio.title}</span>
                      </div>
                      <button 
                        className="icon-btn w-5 h-5"
                        onClick={(e) => { e.stopPropagation(); setRenameDialog({ open: true, type: 'audio', index: idx, value: audio.title }); }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="cyber-divider" />
            
            <div className="section-header">
              Elements on Canvas
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {config.layout?.elements?.length || 0} elements • Double-click to edit
            </p>
            <div className="space-y-1 max-h-[150px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {(config.layout?.elements || []).map((el) => (
                <div 
                  key={el.id} 
                  className="list-item cursor-pointer"
                  onDoubleClick={() => handleElementDoubleClick(el)}
                >
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
        </div>

        {/* Canvas */}
        <div className="editor-canvas cyber-grid" ref={canvasRef}>
          <div className="canvas-workspace" style={{ padding: 0 }}>
            {viewMode === 'interactive' ? (
              <div className="w-full h-full">
                <InteractiveCanvas 
                  config={config} 
                  updateConfig={updateConfig}
                  onElementDoubleClick={handleElementDoubleClick}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="glass relative"
                  style={{
                    width: getDeviceDimensions().width,
                    height: getDeviceDimensions().height,
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}
                >
                  <div className="absolute top-2 left-2 text-[10px] text-[#00ffc8]/50 z-10">
                    {devicePresets[selectedDevice]?.name} ({devicePresets[selectedDevice]?.width}×{devicePresets[selectedDevice]?.height})
                  </div>
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <PreviewCanvas key={previewKey} config={config} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#00ffc8]/30">
          <DialogHeader>
            <DialogTitle className="text-[#00ffc8]">Save Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">Project Name</Label>
              <Input 
                value={presetName} 
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProject} disabled={loading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#00ffc8]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#00ffc8]">Open Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto">
            {savedPresets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No saved projects</p>
            ) : (
              savedPresets.map((preset) => (
                <div 
                  key={preset.id} 
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-[#00ffc8]/10 hover:border-[#00ffc8]/30 cursor-pointer"
                  onClick={() => handleLoadProject(preset)}
                >
                  <div>
                    <p className="text-sm font-medium">{preset.name}</p>
                    <p className="text-xs text-[#00c8ff]/50">
                      {new Date(preset.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    className="icon-btn w-6 h-6 hover:bg-red-500/20"
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(preset.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Element Editor Dialog */}
      <Dialog open={showElementEditor} onOpenChange={setShowElementEditor}>
        <DialogContent className="bg-[#0a0a0a] border-[#00ffc8]/30">
          <DialogHeader>
            <DialogTitle className="text-[#00ffc8]">Edit Element</DialogTitle>
          </DialogHeader>
          {editingElement && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-xs">Label</Label>
                <Input 
                  value={editingElement.label || ''} 
                  onChange={(e) => {
                    setEditingElement({ ...editingElement, label: e.target.value });
                    updateElement(editingElement.id, { label: e.target.value });
                  }}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">X Position</Label>
                  <Input 
                    type="number"
                    value={Math.round(editingElement.x)} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setEditingElement({ ...editingElement, x: val });
                      updateElement(editingElement.id, { x: val });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y Position</Label>
                  <Input 
                    type="number"
                    value={Math.round(editingElement.y)} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setEditingElement({ ...editingElement, y: val });
                      updateElement(editingElement.id, { y: val });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input 
                    type="number"
                    value={Math.round(editingElement.width)} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 50;
                      setEditingElement({ ...editingElement, width: val });
                      updateElement(editingElement.id, { width: val });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input 
                    type="number"
                    value={Math.round(editingElement.height)} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 30;
                      setEditingElement({ ...editingElement, height: val });
                      updateElement(editingElement.id, { height: val });
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Z-Index (Layer)</Label>
                <Input 
                  type="number"
                  value={editingElement.zIndex || 0} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setEditingElement({ ...editingElement, zIndex: val });
                    updateElement(editingElement.id, { zIndex: val });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowElementEditor(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}>
        <DialogContent className="bg-[#0a0a0a] border-[#00ffc8]/30">
          <DialogHeader>
            <DialogTitle className="text-[#00ffc8]">Rename</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={renameDialog.value} 
              onChange={(e) => setRenameDialog({ ...renameDialog, value: e.target.value })}
              placeholder="Enter new name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, type: '', index: -1, value: '' })}>
              Cancel
            </Button>
            <Button onClick={() => handleRename(renameDialog.type, renameDialog.index, renameDialog.value)}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner-minimal" />
        </div>
      )}
    </div>
  );
}
