import React, { useState } from 'react';
import { Image, Music, Layers, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
  || (typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000');
const API = `${BACKEND_URL}/api`;

export default function AssetPanel({ config, updateConfig, presets, onLoadPreset, onDeletePreset }) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleImageUpload = async (event, type = 'background') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      const response = await axios.post(`${API}/upload/image`, formData, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      const imageData = {
        id: Date.now() + Math.random(),
        url: response.data.url,
        name: response.data.name || file.name.replace(/\.[^/.]+$/, ''),
        blendMode: 'screen'
      };

      const backgroundImages = Array.isArray(config.background_images) ? config.background_images : [];
      const galleryImages = Array.isArray(config.gallery_images) ? config.gallery_images : [];

      if (type === 'background') {
        updateConfig('background_images', [...backgroundImages, imageData]);
      } else {
        updateConfig('gallery_images', [...galleryImages, imageData]);
      }

      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingAudio(true);
      const response = await axios.post(`${API}/upload/audio`, formData, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      const audioData = {
        id: Date.now() + Math.random(),
        url: response.data.url,
        name: response.data.name || file.name.replace(/\.[^/.]+$/, ''),
        title: file.name.replace(/\.[^/.]+$/, '')
      };

      const audioTracks = Array.isArray(config.audio_tracks) ? config.audio_tracks : [];
      updateConfig('audio_tracks', [...audioTracks, audioData]);
      toast.success('Audio uploaded!');
    } catch (error) {
      toast.error('Failed to upload audio');
      console.error(error);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingVideo(true);
      const response = await axios.post(`${API}/upload/video`, formData, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      const videoData = {
        id: Date.now() + Math.random(),
        url: response.data.url,
        name: response.data.name || file.name.replace(/\.[^/.]+$/, ''),
        title: file.name.replace(/\.[^/.]+$/, '')
      };

      const videoTracks = Array.isArray(config.video_tracks) ? config.video_tracks : [];
      updateConfig('video_tracks', [...videoTracks, videoData]);
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Failed to upload video');
      console.error(error);
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeImage = (index, type) => {
    const key = type === 'background' ? 'background_images' : 'gallery_images';
    const updated = config[key].filter((_, i) => i !== index);
    updateConfig(key, updated);
    toast.success('Image removed');
  };

  const removeAudio = (index) => {
    const updated = config.audio_tracks.filter((_, i) => i !== index);
    updateConfig('audio_tracks', updated);
    toast.success('Audio removed');
  };

  const removeVideo = (index) => {
    const updated = (config.video_tracks || []).filter((_, i) => i !== index);
    updateConfig('video_tracks', updated);
    toast.success('Video removed');
  };

  return (
    <ScrollArea className="flex-1">
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="w-full grid grid-cols-5 gap-1 p-1 bg-background/50">
          <TabsTrigger value="presets" className="text-xs" data-testid="presets-tab">
            <Layers className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="text-xs" data-testid="backgrounds-tab">
            <Image className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="gallery" className="text-xs" data-testid="gallery-tab">
            <Image className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs" data-testid="video-tab">
            <Video className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs" data-testid="audio-tab">
            <Music className="w-3 h-3" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="p-3 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">Saved presets</p>
          {presets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No presets saved yet</p>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="preset-card group"
                data-testid={`preset-${preset.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0" onClick={() => onLoadPreset(preset.id)}>
                    <h4 className="text-sm font-medium truncate">{preset.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {preset.app_name || 'Untitled'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                    className="opacity-0 group-hover:opacity-100"
                    data-testid={`delete-preset-${preset.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="backgrounds" className="p-3">
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
            className="w-full mb-3"
            onClick={() => document.getElementById('bg-upload').click()}
            disabled={uploadingImage}
            data-testid="upload-background-btn"
          >
            {uploadingImage ? 'Uploading...' : 'Add Background'}
          </Button>

          <div className="space-y-2">
            {config.background_images.map((img, idx) => (
              <div key={idx} className="asset-card" data-testid={`bg-image-${idx}`}>
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{img.name}</p>
                    <p className="text-xs text-muted-foreground">{img.blendMode}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeImage(idx, 'background')}
                    data-testid={`remove-bg-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="p-3">
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
            className="w-full mb-3"
            onClick={() => document.getElementById('gallery-upload').click()}
            disabled={uploadingImage}
            data-testid="upload-gallery-btn"
          >
            {uploadingImage ? 'Uploading...' : 'Add Gallery Image'}
          </Button>

          <div className="space-y-2">
            {config.gallery_images.map((img, idx) => (
              <div key={idx} className="asset-card" data-testid={`gallery-image-${idx}`}>
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{img.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeImage(idx, 'gallery')}
                    data-testid={`remove-gallery-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="video" className="p-3">
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
            className="w-full mb-3"
            onClick={() => document.getElementById('video-upload').click()}
            disabled={uploadingVideo}
            data-testid="upload-video-btn"
          >
            {uploadingVideo ? 'Uploading...' : 'Add Video'}
          </Button>

          <div className="space-y-2">
            {(config.video_tracks || []).map((video, idx) => (
              <div key={idx} className="asset-card" data-testid={`video-track-${idx}`}>
                <div className="flex gap-2">
                  <Video className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{video.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeVideo(idx)}
                    data-testid={`remove-video-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audio" className="p-3">
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
            className="w-full mb-3"
            onClick={() => document.getElementById('audio-upload').click()}
            disabled={uploadingAudio}
            data-testid="upload-audio-btn"
          >
            {uploadingAudio ? 'Uploading...' : 'Add Audio Track'}
          </Button>

          <div className="space-y-2">
            {config.audio_tracks.map((audio, idx) => (
              <div key={idx} className="asset-card" data-testid={`audio-track-${idx}`}>
                <div className="flex gap-2">
                  <Music className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{audio.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{audio.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAudio(idx)}
                    data-testid={`remove-audio-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
}