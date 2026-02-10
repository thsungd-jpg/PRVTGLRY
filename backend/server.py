from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import mimetypes
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import json
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class PWAConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    app_name: str
    icon_color: str = "#F59E0B"
    text_color: str = "#FFFFFF"
    background_color: str = "#000000"
    background_images: List[Dict[str, Any]] = Field(default_factory=list)
    background_blend_mode: str = "screen"
    background_blend_list: List[str] = Field(default_factory=list)
    background_rotation_interval_ms: int = 14000
    background_fade_duration_ms: int = 7000
    background_tint: Dict[str, Any] = Field(default_factory=dict)
    gallery_images: List[Dict[str, Any]] = Field(default_factory=list)
    audio_tracks: List[Dict[str, Any]] = Field(default_factory=list)
    video_tracks: List[Dict[str, Any]] = Field(default_factory=list)
    pages: List[Dict[str, str]] = Field(default_factory=list)
    transitions: Dict[str, Any] = Field(default_factory=dict)
    fx_settings: Dict[str, Any] = Field(default_factory=dict)
    animations: List[Dict[str, Any]] = Field(default_factory=list)
    custom_css: str = ""
    layout: Dict[str, Any] = Field(default_factory=dict)
    page_transition: Dict[str, Any] = Field(default_factory=dict)
    output_profile: str = "classic"
    media_frame_size: int = 720
    device_orientation: str = "portrait"
    nav_auto_hide: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PresetCreate(BaseModel):
    name: str
    config: Dict[str, Any]

class PresetUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "PWA Builder API"}

# Preset Management
@api_router.post("/presets", response_model=PWAConfig)
async def create_preset(preset: PresetCreate):
    config_dict = preset.config.copy()
    config_dict['name'] = preset.name
    config_obj = PWAConfig(**config_dict)
    
    doc = config_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.pwa_presets.insert_one(doc)
    return config_obj

@api_router.get("/presets", response_model=List[PWAConfig])
async def get_presets():
    presets = await db.pwa_presets.find({}, {"_id": 0}).to_list(1000)
    
    for preset in presets:
        if isinstance(preset.get('created_at'), str):
            preset['created_at'] = datetime.fromisoformat(preset['created_at'])
        if isinstance(preset.get('updated_at'), str):
            preset['updated_at'] = datetime.fromisoformat(preset['updated_at'])
    
    return presets

@api_router.get("/presets/{preset_id}", response_model=PWAConfig)
async def get_preset(preset_id: str):
    preset = await db.pwa_presets.find_one({"id": preset_id}, {"_id": 0})
    
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    if isinstance(preset.get('created_at'), str):
        preset['created_at'] = datetime.fromisoformat(preset['created_at'])
    if isinstance(preset.get('updated_at'), str):
        preset['updated_at'] = datetime.fromisoformat(preset['updated_at'])
    
    return preset

@api_router.put("/presets/{preset_id}", response_model=PWAConfig)
async def update_preset(preset_id: str, update: PresetUpdate):
    existing = await db.pwa_presets.find_one({"id": preset_id}, {"_id": 0})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.pwa_presets.update_one(
        {"id": preset_id},
        {"$set": update_data}
    )
    
    updated = await db.pwa_presets.find_one({"id": preset_id}, {"_id": 0})
    
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated

@api_router.delete("/presets/{preset_id}")
async def delete_preset(preset_id: str):
    result = await db.pwa_presets.delete_one({"id": preset_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    return {"message": "Preset deleted successfully"}

# Asset upload endpoint (stores base64 in config)
@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_data = base64.b64encode(contents).decode('utf-8')
        mime_type = file.content_type
        if not mime_type or not mime_type.startswith('image/'):
            guessed = mimetypes.guess_type(file.filename or '')[0]
            mime_type = guessed or 'image/png'
        
        return {
            "url": f"data:{mime_type};base64,{base64_data}",
            "name": file.filename,
            "type": mime_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_data = base64.b64encode(contents).decode('utf-8')
        mime_type = file.content_type or 'audio/mpeg'
        
        return {
            "url": f"data:{mime_type};base64,{base64_data}",
            "name": file.filename,
            "type": mime_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_data = base64.b64encode(contents).decode('utf-8')
        mime_type = file.content_type or 'video/mp4'
        
        return {
            "url": f"data:{mime_type};base64,{base64_data}",
            "name": file.filename,
            "type": mime_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generate PWA endpoint
@api_router.post("/generate-pwa")
async def generate_pwa(config: Dict[str, Any]):
    """
    Generate PWA source code and return as JSON structure
    Client will handle zip creation
    """
    try:
        # Generate PWA files based on config
        files = generate_pwa_files(config)
        return {"files": files, "config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_pwa_files(config: Dict[str, Any]) -> Dict[str, str]:
    """Generate PWA source files based on configuration"""

    output_profile = (config.get('output_profile') or 'classic').lower()
    if output_profile in {'sun-god', 'stats-a', 'stats_a', 'statsa'}:
        return generate_sun_god_files(config)

    app_name = config.get('app_name', 'My PWA')
    icon_color = config.get('icon_color', '#F59E0B')
    text_color = config.get('text_color', '#FFFFFF')
    bg_color = config.get('background_color', '#000000')
    animations = config.get('animations', [])
    custom_css = config.get('custom_css', '')
    video_tracks = config.get('video_tracks', [])
    layout_elements = config.get('layout', {}).get('elements', [])

    # Generate animation CSS
    animation_css = '\n'.join([
        f"""
@keyframes {anim['name']} {{
  {anim['keyframes']}
}}
.anim-{anim['name']} {{
  animation: {anim['name']} {anim['duration']}ms {anim['timing']} {anim.get('iteration', 'infinite')};
}}
        """
        for anim in animations
    ])
    
    # Generate package.json
    package_json = {
        "name": app_name.lower().replace(' ', '-'),
        "version": "1.0.0",
        "private": True,
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.20.0",
            "react-scripts": "5.0.1"
        },
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
        }
    }
    
    # Generate index.html
    index_html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="{icon_color}" />
    <meta name="description" content="{app_name}" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>{app_name}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"""
    
    # Generate App.js
    app_js = f"""import React, {{ useState, useEffect }} from 'react';
import './App.css';

function App() {{
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  
  const backgroundImages = {json.dumps(config.get('background_images', []))};
  const galleryImages = {json.dumps(config.get('gallery_images', []))};
  const videoTracks = {json.dumps(video_tracks)};
  const layoutElements = {json.dumps(layout_elements)};
  const pages = {json.dumps(config.get('pages', [{'id': 'home', 'title': 'Home'}]))};
  
  useEffect(() => {{
    if (backgroundImages.length > 1) {{
      const interval = setInterval(() => {{
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }}, 14000);
      return () => clearInterval(interval);
    }}
  }}, [backgroundImages.length]);
  
  return (
    <div className="App" style={{{{ backgroundColor: '{bg_color}', color: '{text_color}' }}}}>
      {{backgroundImages.length > 0 && (
        <div className="background-container">
          <div 
            className="background-image"
            style={{{{
              backgroundImage: `url(${{backgroundImages[currentImageIndex]?.url}})`,
              mixBlendMode: '{config.get('background_blend_mode', 'screen')}'
            }}}}
          />
        </div>
      )}}
      
      <nav className="navbar">
        <h1 style={{{{ color: '{icon_color}' }}}}>{app_name}</h1>
        <div className="nav-links">
          {{pages.map(page => (
            <button 
              key={{page.id}} 
              onClick={{() => setCurrentPage(page.id)}}
              className={{currentPage === page.id ? 'active' : ''}}
            >
              {{page.title}}
            </button>
          ))}}
        </div>
      </nav>
      
      <main className="content">
        <h2>Welcome to {{app_name}}</h2>
        
        {{videoTracks.length > 0 && (
          <div className="video-player">
            <h3>Videos</h3>
            {{videoTracks.map((video, idx) => (
              <div key={{idx}} style={{{{ marginBottom: '2rem' }}}}>
                <video controls style={{{{ width: '100%', maxWidth: '800px', borderRadius: '8px' }}}}>
                  <source src={{video.url}} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p style={{{{ textAlign: 'center', marginTop: '0.5rem' }}}}>{{video.title}}</p>
              </div>
            ))}}
          </div>
        )}}
        
        {{galleryImages.length > 0 && (
          <div className="gallery">
            {{galleryImages.map((img, idx) => (
              <img key={{idx}} src={{img.url}} alt={{img.name || `Image ${{idx + 1}}`}} />
            ))}}
          </div>
        )}}
        
        {{layoutElements.length > 0 && (
          <div style={{{{ position: 'relative', minHeight: '600px', marginTop: '2rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px' }}}}>
            {{layoutElements.map((el, idx) => (
              <div 
                key={{idx}}
                style={{{{
                  position: 'absolute',
                  left: `${{el.x}}px`,
                  top: `${{el.y}}px`,
                  width: `${{el.width}}px`,
                  height: `${{el.height}}px`,
                  transform: `rotate(${{el.rotation}}deg)`,
                  zIndex: el.zIndex,
                  border: '2px solid rgba(245,158,11,0.5)',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}}}
              >
                {{el.type}}
              </div>
            ))}}
          </div>
        )}}
      </main>
    </div>
  );
}}

export default App;
"""
    
    # Generate App.css
    app_css = f"""* {{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}}

.App {{
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}}

.background-container {{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}}

.background-image {{
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: opacity 7s ease-in-out;
}}

.navbar {{
  position: relative;
  z-index: 10;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}}

.navbar h1 {{
  font-size: 1.5rem;
  font-weight: bold;
}}

.nav-links {{
  display: flex;
  gap: 1rem;
}}

.nav-links button {{
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: {text_color};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}}

.nav-links button:hover,
.nav-links button.active {{
  background: rgba(255, 255, 255, 0.1);
  border-color: {icon_color};
}}

.content {{
  position: relative;
  z-index: 5;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}}

.content h2 {{
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}}

.gallery {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}}

.gallery img {{
  width: 100%;
  height: 250px;
  object-fit: contain;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
}}

.video-player {{
  margin-top: 2rem;
  text-align: center;
}}

.video-player h3 {{
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}}

.video-player video {{
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}}

/* Layout elements */
.layout-container {{
  position: relative;
  min-height: 600px;
  margin-top: 2rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}}

/* Custom Animations */
{animation_css}

/* Custom CSS */
{custom_css}
"""
    
    # Generate manifest.json
    manifest = {
        "short_name": app_name[:12],
        "name": app_name,
        "icons": [
            {
                "src": "favicon.ico",
                "sizes": "64x64 32x32 24x24 16x16",
                "type": "image/x-icon"
            }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": icon_color,
        "background_color": bg_color
    }
    
    return {
        "package.json": json.dumps(package_json, indent=2),
        "public/index.html": index_html,
        "public/manifest.json": json.dumps(manifest, indent=2),
        "src/App.js": app_js,
        "src/App.css": app_css,
        "src/index.js": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './index.css';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);",
        "src/index.css": "body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;\n}",
        "README.md": f"# {app_name}\n\nGenerated PWA created with PWA Builder.\n\n## Getting Started\n\n1. Install dependencies:\n```bash\nnpm install\n```\n\n2. Start development server:\n```bash\nnpm start\n```\n\n3. Build for production:\n```bash\nnpm run build\n```"
    }

def _normalize_media(items: Any) -> List[str]:
  if not items:
    return []
  normalized: List[str] = []
  for item in items:
    if isinstance(item, dict):
      url = item.get('url') or item.get('src') or item.get('path')
      if url:
        normalized.append(url)
    elif isinstance(item, str):
      normalized.append(item)
  return normalized

def _safe_text(value: Any) -> str:
    if value is None:
        return ''
    if isinstance(value, (dict, list)):
        return ''
    return str(value)

def generate_sun_god_files(config: Dict[str, Any]) -> Dict[str, str]:
    app_name = config.get('app_name', 'Sun God Media Experience')
    icon_color = config.get('icon_color', '#00ffc8')
    text_color = config.get('text_color', '#ffffff')
    bg_color = config.get('background_color', '#000000')
    background_blend_mode = config.get('background_blend_mode', 'screen')
    background_blend_list = config.get('background_blend_list', [])
    background_rotation_interval_ms = int(config.get('background_rotation_interval_ms') or 14000)
    background_fade_duration_ms = int(config.get('background_fade_duration_ms') or 7000)
    background_tint = config.get('background_tint') or {'enabled': True, 'color': '#ffffff', 'opacity': 0.08}
    media_frame_size = int(config.get('media_frame_size') or 720)
    nav_auto_hide = bool(config.get('nav_auto_hide', True))
    slideshow_settings = config.get('slideshow_settings') or {}

    assets_manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "images": _normalize_media(config.get('gallery_images')),
        "backgroundImages": _normalize_media(config.get('background_images')),
        "audio": _normalize_media(config.get('audio_tracks')),
        "videos": _normalize_media(config.get('video_tracks')),
        "text": ["/assets/text/DESCRIPTION.txt", "/assets/text/TITLE.txt"],
    }

    text_sections = config.get('text_sections') or {}
    title_text = _safe_text(text_sections.get('title')) or app_name
    description_text = (
        _safe_text(text_sections.get('header'))
        or _safe_text(text_sections.get('subHeader'))
        or _safe_text(text_sections.get('footer'))
        or "A calm, media-first experience designed for uninterrupted presence."
    )

    package_json = {
        "name": app_name.lower().replace(' ', '-'),
        "private": True,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.20.0"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.2.1",
            "vite": "^5.0.12"
        }
    }

    vite_config = """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
"""

    index_html = f"""<!doctype html>
<html lang=\"en\">
  <head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <meta name=\"theme-color\" content=\"{icon_color}\" />
    <link rel=\"manifest\" href=\"/manifest.json\" />
    <title>{app_name}</title>
  </head>
  <body>
    <div id=\"root\"></div>
    <script type=\"module\" src=\"/src/main.jsx\"></script>
  </body>
</html>
"""

    main_jsx = """import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
"""

    embedded_assets = {
        "images": assets_manifest["images"],
        "backgroundImages": assets_manifest["backgroundImages"],
        "audio": assets_manifest["audio"],
        "videos": assets_manifest["videos"],
        "text": assets_manifest["text"],
    }

    pages = config.get('pages') or [{"id": "gallery", "title": "Gallery"}, {"id": "video", "title": "Video"}]
    if not pages:
        pages = [{"id": "gallery", "title": "Gallery"}]

    config_payload = {
        "appName": app_name,
        "iconColor": icon_color,
        "textColor": text_color,
        "backgroundBlendMode": background_blend_mode,
        "backgroundBlendList": background_blend_list,
        "backgroundRotationIntervalMs": background_rotation_interval_ms,
        "backgroundFadeDurationMs": background_fade_duration_ms,
        "backgroundTint": background_tint,
        "mediaFrameSize": media_frame_size,
        "navAutoHide": nav_auto_hide,
        "slideshowSettings": {
            "transition": slideshow_settings.get("transition", "fade"),
            "duration": int(slideshow_settings.get("duration") or 5000),
            "autoPlay": bool(slideshow_settings.get("autoPlay", True)),
            "loop": bool(slideshow_settings.get("loop", True)),
        },
        "pages": pages,
        "titleText": title_text,
        "descriptionText": description_text,
    }
    config_json = json.dumps(config_payload, ensure_ascii=False)
    assets_json = json.dumps(embedded_assets, ensure_ascii=False)

    app_jsx_template = """import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

const CONFIG = __CONFIG_JSON__;
const EMBEDDED_ASSETS = __ASSETS_JSON__;

const rafThrottle = (fn) => {
  let frame = null;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      fn(...lastArgs);
    });
  };
};

const useAssets = () => {
  const [assets, setAssets] = useState(EMBEDDED_ASSETS);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/assets/assets-manifest.json', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setAssets({
          images: Array.isArray(json.images) ? json.images : [],
          backgroundImages: Array.isArray(json.backgroundImages) ? json.backgroundImages : [],
          audio: Array.isArray(json.audio) ? json.audio : [],
          videos: Array.isArray(json.videos) ? json.videos : [],
          text: Array.isArray(json.text) ? json.text : [],
        });
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  return assets;
};

const Gallery = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const { transition, duration, autoPlay, loop } = CONFIG.slideshowSettings || {};

  const next = useCallback(() => {
    if (!images.length) return;
    setFade(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
      setFade(false);
    }, Math.min(450, duration / 10));
  }, [images.length, duration]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return undefined;
    const interval = setInterval(() => {
      if (!loop && index === images.length - 1) return;
      next();
    }, duration);
    return () => clearInterval(interval);
  }, [autoPlay, duration, images.length, index, loop, next]);

  if (!images.length) return (
    <div className="empty-state">Add gallery images to see the slideshow.</div>
  );

  return (
    <div className="gallery-frame" data-transition={transition} onClick={next}>
      <img src={images[index]} alt="Gallery" className={fade ? 'gallery-image fade' : 'gallery-image'} />
    </div>
  );
};

const VideoDeck = ({ videos }) => {
  if (!videos.length) return (
    <div className="empty-state">Add videos to see them here.</div>
  );
  return (
    <div className="video-stack">
      {videos.map((src, idx) => (
        <video key={idx} className="video-card" controls>
          <source src={src} />
        </video>
      ))}
    </div>
  );
};

const AudioPlayer = ({ tracks }) => {
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = tracks[trackIndex] || '';
    if (isPlaying) audioRef.current.play();
  }, [trackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const next = () => {
    if (!tracks.length) return;
    setTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const prev = () => {
    if (!tracks.length) return;
    setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  if (!tracks.length) return (
    <div className="empty-state">Add audio tracks to enable the player.</div>
  );

  return (
    <div className="audio-shell">
      <audio ref={audioRef} onEnded={next} />
      <div className="audio-main">
        <div className="track-info">Track {trackIndex + 1} / {tracks.length}</div>
        <div className="audio-controls">
          <button onClick={prev}>Prev</button>
          <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={next}>Next</button>
          <button onClick={() => setShowPlaylist((prev) => !prev)}>{showPlaylist ? 'Hide' : 'Playlist'}</button>
        </div>
        <div className="volume-row">
          <span>Volume</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
        </div>
      </div>
      {showPlaylist && (
        <div className="playlist-panel">
          {tracks.map((track, idx) => (
            <button key={idx} className={idx === trackIndex ? 'active' : ''} onClick={() => setTrackIndex(idx)}>
              Track {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const assets = useAssets();
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--media-frame-size', String(CONFIG.mediaFrameSize) + 'px');
  }, []);

  useEffect(() => {
    if (!CONFIG.navAutoHide) return undefined;
    const hideTimeout = { current: null };
    const showNav = rafThrottle(() => {
      setNavVisible(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setNavVisible(false), 1200);
    });
    window.addEventListener('mousemove', showNav);
    window.addEventListener('touchstart', showNav);
    showNav();
    return () => {
      window.removeEventListener('mousemove', showNav);
      window.removeEventListener('touchstart', showNav);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const backgroundImages = Array.isArray(assets.backgroundImages) ? assets.backgroundImages : [];
    const backgroundSizes = backgroundImages.map((src) =>
      src.toLowerCase().includes('background%202') || src.toLowerCase().includes('background 2') ? '90% 90%' : 'cover'
    );
    const blends = CONFIG.backgroundBlendList?.length ? CONFIG.backgroundBlendList : [CONFIG.backgroundBlendMode];
    const blendForIndex = (idx) => blends[(idx % blends.length + blends.length) % blends.length] || CONFIG.backgroundBlendMode;

    if (!backgroundImages.length) {
      rootStyle.setProperty('--bg-image', 'none');
      rootStyle.setProperty('--bg-image-next', 'none');
      rootStyle.setProperty('--bg-size-stack', 'cover');
      rootStyle.setProperty('--bg-size-next', 'cover');
      rootStyle.setProperty('--bg-blend-mode', 'normal');
      rootStyle.setProperty('--bg-next-blend-mode', 'normal');
      return undefined;
    }

    const idxRef = { current: 0 };
    const applyCurrent = () => {
      rootStyle.setProperty('--bg-image', 'url(' + backgroundImages[idxRef.current] + ')');
      rootStyle.setProperty('--bg-size-stack', backgroundSizes[idxRef.current] || 'cover');
      rootStyle.setProperty('--bg-blend-mode', blendForIndex(idxRef.current));
    };
    applyCurrent();
    if (backgroundImages.length === 1) return undefined;

    const interval = setInterval(() => {
      const nextIdx = (idxRef.current + 1) % backgroundImages.length;
      rootStyle.setProperty('--bg-image-next', 'url(' + backgroundImages[nextIdx] + ')');
      rootStyle.setProperty('--bg-size-next', backgroundSizes[nextIdx] || 'cover');
      rootStyle.setProperty('--bg-next-blend-mode', blendForIndex(nextIdx));
      document.body.classList.add('bg-fading');
      setTimeout(() => {
        idxRef.current = nextIdx;
        applyCurrent();
        document.body.classList.remove('bg-fading');
      }, CONFIG.backgroundFadeDurationMs || 7000);
    }, CONFIG.backgroundRotationIntervalMs || 14000);

    return () => clearInterval(interval);
  }, [assets.backgroundImages]);

  const pages = CONFIG.pages?.length ? CONFIG.pages : [{"id":"gallery","title":"Gallery"}];
  const activePath = location.pathname === '/' ? '/' + (pages[0]?.id || '') : location.pathname;

  useEffect(() => {
    if (location.pathname === '/') navigate(activePath, { replace: true });
  }, [location.pathname, activePath, navigate]);

  return (
    <div className="sun-god-app" style={{ color: CONFIG.textColor }}>
      {CONFIG.backgroundTint?.enabled && (
        <div className="bg-tint" style={{ background: CONFIG.backgroundTint.color || '#ffffff', opacity: CONFIG.backgroundTint.opacity ?? 0.08 }} />
      )}
      <header className={navVisible ? 'app-nav visible' : 'app-nav hidden'}>
        <div className="nav-title">{CONFIG.appName}</div>
        <nav className="nav-links">
          {pages.map((page) => (
            <button key={page.id} className={activePath === '/' + page.id ? 'active' : ''} onClick={() => navigate('/' + page.id)}>
              {page.title}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <div className="title-block">
          <h1>{CONFIG.titleText}</h1>
          <p>{CONFIG.descriptionText}</p>
        </div>
        <Routes>
          <Route path="/gallery" element={(<Gallery images={assets.images || []} />)} />
          <Route path="/video" element={(<VideoDeck videos={assets.videos || []} />)} />
          <Route path="/audio" element={(<AudioPlayer tracks={assets.audio || []} />)} />
          <Route path="*" element={(<Gallery images={assets.images || []} />)} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
"""

    app_jsx = app_jsx_template.replace("__CONFIG_JSON__", config_json).replace("__ASSETS_JSON__", assets_json)

    app_css = f"""* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}

html, body, #root {{
  width: 100%;
  height: 100%;
  background: {bg_color};
  font-family: 'Inter', system-ui, sans-serif;
  color: {text_color};
  overflow: hidden;
}}

body::before,
body::after {{
  content: '';
  position: fixed;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: var(--bg-size-stack, cover);
  pointer-events: none;
  z-index: 0;
  transition: opacity {background_fade_duration_ms}ms ease;
}}

body::before {{
  background-image: var(--bg-image, none);
  mix-blend-mode: var(--bg-blend-mode, normal);
  opacity: 1;
}}

body::after {{
  background-image: var(--bg-image-next, none);
  background-size: var(--bg-size-next, cover);
  mix-blend-mode: var(--bg-next-blend-mode, normal);
  opacity: 0;
}}

body.bg-fading::after {{
  opacity: 1;
}}

body.bg-fading::before {{
  opacity: 0;
}}

.sun-god-app {{
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}}

.bg-tint {{
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: screen;
}}

.app-nav {{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: opacity 0.3s ease;
  z-index: 5;
}}

.app-nav.hidden {{
  opacity: 0;
  pointer-events: none;
}}

.nav-title {{
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: {icon_color};
}}

.nav-links {{
  display: flex;
  gap: 0.6rem;
}}

.nav-links button {{
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: {text_color};
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}}

.nav-links button.active {{
  border-color: {icon_color};
  color: {icon_color};
}}

.main-content {{
  margin-top: 4.5rem;
  padding: 2.5rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}}

.title-block {{
  text-align: center;
  max-width: 720px;
}}

.title-block h1 {{
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-shadow: 0 0 20px rgba(0,0,0,0.4);
}}

.title-block p {{
  margin-top: 0.8rem;
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.6;
}}

.gallery-frame {{
  width: min(var(--media-frame-size, 720px), 92vw);
  height: min(calc(var(--media-frame-size, 720px) * 0.62), 62vh);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}}

.gallery-image {{
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.4s ease;
}}

.gallery-image.fade {{
  opacity: 0.3;
}}

.video-stack {{
  width: min(900px, 92vw);
  display: grid;
  gap: 1.2rem;
}}

.video-card {{
  width: 100%;
  border-radius: 18px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.08);
}}

.audio-shell {{
  width: min(720px, 92vw);
  border-radius: 20px;
  background: rgba(0,0,0,0.5);
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.1);
}}

.audio-controls {{
  display: flex;
  gap: 0.6rem;
  margin: 1rem 0;
}}

.audio-controls button {{
  flex: 1;
  padding: 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: {text_color};
  cursor: pointer;
}}

.volume-row {{
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
}}

.volume-row input {{
  flex: 1;
}}

.playlist-panel {{
  margin-top: 1rem;
  display: grid;
  gap: 0.4rem;
}}

.playlist-panel button {{
  padding: 0.4rem 0.6rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: {text_color};
  cursor: pointer;
  text-align: left;
}}

.playlist-panel button.active {{
  border-color: {icon_color};
  color: {icon_color};
}}

.empty-state {{
  padding: 2rem;
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.4);
  text-align: center;
  opacity: 0.7;
}}

{config.get('custom_css', '')}
"""

    index_css = """body {
  margin: 0;
  background: #000;
  font-family: 'Inter', system-ui, sans-serif;
}
"""

    manifest = {
        "short_name": app_name[:12],
        "name": app_name,
        "icons": [
            {
                "src": "favicon.ico",
                "sizes": "64x64 32x32 24x24 16x16",
                "type": "image/x-icon"
            }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": icon_color,
        "background_color": bg_color
    }

    return {
        "package.json": json.dumps(package_json, indent=2),
        "vite.config.js": vite_config,
        "index.html": index_html,
        "public/manifest.json": json.dumps(manifest, indent=2),
        "public/assets/assets-manifest.json": json.dumps(assets_manifest, indent=2),
        "public/assets/text/TITLE.txt": title_text,
        "public/assets/text/DESCRIPTION.txt": description_text,
        "src/main.jsx": main_jsx,
        "src/App.jsx": app_jsx,
        "src/App.css": app_css,
        "src/index.css": index_css,
        "README.md": f"# {app_name}\n\nGenerated Sun God Media Experience PWA.\n\n## Getting Started\n\n1. Install dependencies:\n```bash\nnpm install\n```\n\n2. Start development server:\n```bash\nnpm run dev\n```\n\n3. Build for production:\n```bash\nnpm run build\n```",
    }

# Include the router in the main app
app.include_router(api_router)

cors_env = os.environ.get('CORS_ORIGINS')
if cors_env:
  allow_origins = [origin.strip() for origin in cors_env.split(',') if origin.strip()]
else:
  allow_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ]

allow_credentials = '*' not in allow_origins

app.add_middleware(
  CORSMiddleware,
  allow_credentials=allow_credentials,
  allow_origins=allow_origins,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()