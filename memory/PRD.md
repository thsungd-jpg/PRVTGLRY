# PRVT BLDR - PWA Builder Application

## Original Problem Statement
Build a PWA (Progressive Web App) Builder application consisting of two parts:
1. **Personal App (Phase 1):** Editor for customizing and generating PWAs with features like app name, colors, assets, transitions, layouts, audio/video, and animations.
2. **Public Website (Phase 2):** A public-facing version with user authentication and Stripe paywall.

## Core Requirements
- PWA customization (name, colors, backgrounds, media)
- Template system for quick layouts
- Interactive canvas for element manipulation
- Export to downloadable PWA package
- Futuristic, no-scroll UI design

---

## What's Been Implemented

### Phase 1: Personal App ✅ COMPLETE

#### Latest Update (Jan 15, 2026 - Session 2)
All 6 new features implemented:

1. **Always-On Edit Mode** ✅
   - Removed view mode toggle
   - Canvas is always interactive (click/drag/resize anytime)
   - "EDIT MODE" badge always shown
   - No need to switch between modes

2. **Page-Based Content Organization** ✅
   - "Pages & Content" section in sidebar
   - Click page name to expand/collapse
   - Shows elements nested under each page
   - Displays element count (e.g., "5 items")
   - Elements show coordinates

3. **Font Customization** ✅
   - Full Google Fonts library (~60+ popular fonts)
   - Categories: Sans Serif, Serif, Display, Monospace, Handwriting
   - Search/filter fonts
   - Custom font upload (.ttf, .otf, .woff, .woff2)
   - Per-element font override
   - Fonts rendered in their actual typeface in selector

4. **Enhanced Glow Effects** ✅
   - Per-element glow settings (via right-click → "Edit Glow Effects")
   - Basic glow: Enable, Color, Intensity, Spread
   - **Pulsate Effect**: Speed, Min/Max Intensity
   - **Flash Effect**: Total Speed, On Duration, Off Duration
   - **Color Shift**: Speed, Custom color array with preview

5. **Per-Element Glow Settings** ✅
   - Each element has its own glow configuration
   - Independent of global glow settings
   - Accessible via right-click context menu
   - All effects (pulsate, flash, color shift) configurable

6. **Right-Click on Sidebar Items** ✅
   - Right-click any element in "Pages & Content" list
   - **Duplicate** option
   - **Delete** option (red)
   - Quick element management without opening canvas menu

#### Previously Implemented Features
- 21+ templates (Slideshow, Video, Gallery, Hero, Portfolio, etc.)
- Text sections (Title, Header, Sub Header, Footer, Sub Footer)
- PRVT BLDR branding with neon blue/green theme
- 30+ device presets (iPhones, Pixels, Galaxy, iPads, Surface, etc.)
- Save/Open projects (MongoDB)
- Pages & page transitions
- Slideshow settings (transitions, duration, autoplay, loop)
- Player frame styles (Minimal, Rounded, Glassmorphism, Neon, Retro)
- Interactive canvas with resize handles
- Enhanced right-click menu (Edit, Copy, Duplicate, Align, Layer, Transform, Size, Lock, Hide)
- Upload media (images, videos, audio) with auto-add to canvas
- PWA generation and export

---

## Architecture

### Tech Stack
- **Frontend:** React 18 + Tailwind CSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Fonts:** Google Fonts API + Custom font upload
- **Styling:** Custom CSS with neon blue/green theme (#00ffc8, #00c8ff)

### Key Files
```
/app/
├── backend/
│   └── server.py              # API endpoints, PWA generation
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── EditorNew.jsx  # Main editor (all features)
│       ├── components/editor/
│       │   ├── PreviewCanvas.jsx     # Preview rendering
│       │   └── InteractiveCanvas.jsx # Interactive editing + glow
│       ├── App.css            # Editor styles
│       └── index.css          # Global styles
```

### API Endpoints
- `POST /api/upload/image` - Upload images (base64)
- `POST /api/upload/video` - Upload videos (base64)
- `POST /api/upload/audio` - Upload audio (base64)
- `POST /api/generate-pwa` - Generate PWA package
- `GET/POST /api/presets` - Manage saved projects
- `DELETE /api/presets/{id}` - Delete project

---

## Font Library

### Google Fonts (Pre-loaded)
| Category | Fonts |
|----------|-------|
| Sans Serif | Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Nunito, Raleway, Work Sans, Outfit, DM Sans, Plus Jakarta Sans, Manrope, Space Grotesk, Urbanist |
| Serif | Playfair Display, Merriweather, Lora, Crimson Text, Source Serif Pro, Libre Baskerville, EB Garamond, Cormorant Garamond, Bitter, Spectral |
| Display | Bebas Neue, Oswald, Anton, Archivo Black, Passion One, Righteous, Black Ops One, Bungee, Fugaz One, Russo One |
| Monospace | JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Roboto Mono, Space Mono, Ubuntu Mono, Inconsolata |
| Handwriting | Dancing Script, Pacifico, Caveat, Great Vibes, Satisfy, Lobster, Sacramento, Kaushan Script, Amatic SC, Permanent Marker |

### Custom Font Support
- Upload: .ttf, .otf, .woff, .woff2
- Stored as base64 in project config
- Available immediately after upload

---

## Glow Effects Reference

### Basic Glow
- **Enable**: Toggle on/off
- **Color**: Hex color picker
- **Intensity**: 5-80px
- **Spread**: 0-50px

### Pulsate Effect
- **Speed**: 200-5000ms (animation cycle)
- **Min Intensity**: Starting glow intensity
- **Max Intensity**: Peak glow intensity

### Flash Effect
- **Total Speed**: 100-2000ms (full cycle)
- **On Duration**: Time glow is visible
- **Off Duration**: Time glow is hidden

### Color Shift
- **Speed**: 500-10000ms (transition between colors)
- **Colors**: Comma-separated hex values (e.g., "#00ffc8, #00c8ff, #ff00c8")

---

## Testing Status
- All 6 new features verified via screenshots
- Font panel with search working
- Glow editor with all effects working
- Sidebar context menu working
- Always-on edit mode confirmed

---

## Prioritized Backlog

### P0 - Critical
- [ ] **Phase 2: Public Website**
  - User authentication (JWT)
  - Stripe paywall integration
  - Public-facing editor

### P1 - High Priority
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts (Ctrl+S, Ctrl+Z, Delete)
- [ ] Template preview thumbnails

### P2 - Medium Priority
- [ ] Animation presets library
- [ ] Export to APK/iOS
- [ ] Multi-select elements

### P3 - Low Priority / Future
- [ ] User-submitted template marketplace
- [ ] Collaboration features
- [ ] Version history

---

## Known Issues
- None currently reported

## Notes
- All Phase 1 features complete as of Jan 15, 2026
- Always-on edit mode removes friction
- Per-element glow with advanced effects (pulsate, flash, color shift)
- Full Google Fonts + custom font upload support
