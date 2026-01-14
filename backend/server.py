from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
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
    gallery_images: List[Dict[str, Any]] = Field(default_factory=list)
    audio_tracks: List[Dict[str, Any]] = Field(default_factory=list)
    video_tracks: List[Dict[str, Any]] = Field(default_factory=list)
    pages: List[Dict[str, str]] = Field(default_factory=list)
    transitions: Dict[str, Any] = Field(default_factory=dict)
    fx_settings: Dict[str, Any] = Field(default_factory=dict)
    animations: List[Dict[str, Any]] = Field(default_factory=list)
    custom_css: str = ""
    layout: Dict[str, Any] = Field(default_factory=dict)
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
        mime_type = file.content_type or 'image/png'
        
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
                <p style={{{{ textAlign: 'center', marginTop: '0.5rem' }}}}>{video.title}</p>
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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