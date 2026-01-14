import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Play, Settings, Sliders, Move, LayoutTemplate, FileText, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="editor-layout">
      {/* Left Panel - Assets & Presets */}
      <div className="editor-panel" data-testid="asset-panel">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-primary">PWA Builder</h2>
          <p className="text-xs text-muted-foreground mt-1">Build & customize your PWA</p>
        </div>
        
        <AssetPanel 
          config={config} 
          updateConfig={updateConfig}
          presets={presets}
          onLoadPreset={handleLoadPreset}
          onDeletePreset={handleDeletePreset}
        />
      </div>

      {/* Center Panel - Preview */}
      <div className="editor-canvas" data-testid="preview-canvas">
        <div className="flex items-center justify-between p-3 bg-card border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{config.app_name}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'interactive' ? 'default' : 'ghost'}
              onClick={() => setViewMode(viewMode === 'preview' ? 'interactive' : 'preview')}
              data-testid="toggle-interactive-btn"
            >
              <Move className="w-4 h-4 mr-1" />
              {viewMode === 'interactive' ? 'Interactive' : 'Preview'}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshPreview}
              data-testid="refresh-preview-btn"
            >
              <Play className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
              id="import-config"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.getElementById('import-config').click()}
              data-testid="import-config-btn"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPresetDialog(true)}
              data-testid="save-preset-btn"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Preset
            </Button>
            
            <Button
              size="sm"
              onClick={handleGeneratePWA}
              disabled={loading}
              data-testid="generate-pwa-btn"
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  Generate PWA
                </>
              )}
            </Button>
          </div>
        </div>
        
        <DevicePreview selectedDevice={selectedDevice} onDeviceChange={setSelectedDevice}>
          <PreviewCanvas key={previewKey} config={config} />
        </DevicePreview>
      </div>

      {/* Right Panel - Properties & Advanced */}
      <div className="editor-panel border-l" data-testid="properties-panel">
        <Tabs defaultValue="properties" className="h-full flex flex-col">
          <div className="p-3 border-b border-white/10">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="properties" className="text-xs" data-testid="properties-tab">
                <Settings className="w-3 h-3 mr-1" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs" data-testid="templates-tab">
                <LayoutTemplate className="w-3 h-3 mr-1" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs" data-testid="layout-tab">
                <Move className="w-3 h-3 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs" data-testid="advanced-tab">
                <Sliders className="w-3 h-3 mr-1" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="properties" className="flex-1 mt-0">
            <PropertiesPanel config={config} updateConfig={updateConfig} />
          </TabsContent>

          <TabsContent value="templates" className="flex-1 mt-0">
            <TemplatesPanel onApplyTemplate={handleApplyTemplate} />
          </TabsContent>

          <TabsContent value="layout" className="flex-1 mt-0">
            <LayoutPanel config={config} updateConfig={updateConfig} />
          </TabsContent>

          <TabsContent value="advanced" className="flex-1 mt-0">
            <AdvancedPanel config={config} updateConfig={updateConfig} />
          </TabsContent>
        </Tabs>
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