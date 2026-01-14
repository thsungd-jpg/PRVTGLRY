# PWA Builder - Personal App

A powerful visual editor for creating and customizing Progressive Web Apps (PWAs) based on the Sun God Media Experience template.

## Features

### Editor Interface
- **3-Panel Layout**: Assets panel, live preview canvas, and properties panel
- **Live Preview**: Real-time iframe preview of your PWA as you customize it
- **Preset Management**: Save, load, and delete PWA configurations
- **Asset Management**: Upload and manage background images, gallery images, and audio tracks

### Customization Options
- **App Settings**: App name, colors (icon, text, background)
- **Background Effects**: Blend modes with live preview
- **Transitions**: Configurable duration and fade time
- **Visual Effects**: Blur during transition, white tint overlay
- **Pages**: Multiple page support with navigation
- **Assets**: 
  - Background images with blend modes
  - Gallery images
  - Audio tracks

### Export Options
1. **Generate PWA**: Download complete React/Vite source code as ZIP
2. **Export Config**: Save configuration as JSON for later import
3. **Import Config**: Load previously saved configurations

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend**: FastAPI, Python 3.x
- **Database**: MongoDB (Motor async driver)
- **Build Tools**: Vite, JSZip for file generation

## Project Structure

```
/app/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Editor.jsx     # Main editor page
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── AssetPanel.jsx        # Left panel - assets & presets
│   │   │   │   ├── PropertiesPanel.jsx   # Right panel - properties
│   │   │   │   ├── PreviewCanvas.jsx     # Center - live preview
│   │   │   │   └── PresetDialog.jsx      # Save preset dialog
│   │   │   └── ui/             # Shadcn UI components
│   │   ├── App.js              # Root component
│   │   ├── App.css             # App styles
│   │   └── index.css           # Global styles (Sun God theme)
│   ├── package.json
│   └── .env                    # Environment variables
└── design_guidelines.json      # Sun God Eclipse design system
```

## API Endpoints

### Presets
- `GET /api/presets` - List all presets
- `POST /api/presets` - Create new preset
- `GET /api/presets/{id}` - Get specific preset
- `PUT /api/presets/{id}` - Update preset
- `DELETE /api/presets/{id}` - Delete preset

### Assets
- `POST /api/upload/image` - Upload image (returns base64 data URL)
- `POST /api/upload/audio` - Upload audio (returns base64 data URL)

### Generation
- `POST /api/generate-pwa` - Generate PWA source files

## Configuration Schema

```json
{
  "app_name": "My PWA App",
  "icon_color": "#F59E0B",
  "text_color": "#FFFFFF",
  "background_color": "#000000",
  "background_images": [
    { "url": "data:image/...", "name": "bg1.jpg", "blendMode": "screen" }
  ],
  "background_blend_mode": "screen",
  "gallery_images": [
    { "url": "data:image/...", "name": "img1.jpg" }
  ],
  "audio_tracks": [
    { "url": "data:audio/...", "name": "track1.mp3", "title": "Track 1" }
  ],
  "pages": [
    { "id": "home", "title": "Home" }
  ],
  "transitions": {
    "duration": 7000,
    "fadeTime": 3500
  },
  "fx_settings": {
    "blur": false,
    "whiteTint": false
  }
}
```

## Generated PWA Structure

When you click "Generate PWA", you'll download a ZIP file containing:

```
my-pwa/
├── package.json           # React dependencies
├── public/
│   ├── index.html        # Entry HTML
│   └── manifest.json     # PWA manifest
├── src/
│   ├── App.js            # Main component
│   ├── App.css           # Styles
│   ├── index.js          # Entry point
│   └── index.css         # Base styles
├── pwa-config.json       # Your configuration (for re-import)
└── README.md             # Getting started guide
```

## Design System - Sun God Eclipse

The editor follows the "Sun God Eclipse" design system:

- **Theme**: Dark mode with professional feel
- **Primary Color**: Amber/Gold (#F59E0B) - "Sun God" energy
- **Accent**: Electric Blue (#3B82F6) for active states
- **Typography**: 
  - Headings: Space Grotesk (bold, tech-forward)
  - Body: Inter (clean, readable)
  - Code: JetBrains Mono
- **Layout**: High-density cockpit design for maximum workspace

## Usage Guide

### Basic Workflow

1. **Customize Your PWA**
   - Change app name and colors in Properties panel
   - Upload background images in Assets panel
   - Add gallery images and audio tracks
   - Adjust blend modes and transitions

2. **Preview Changes**
   - Live preview updates automatically
   - Click "Refresh" to reload preview

3. **Save Configuration**
   - Click "Save Preset" to store your configuration
   - Give it a memorable name
   - Load presets anytime from Assets panel

4. **Generate PWA**
   - Click "Generate PWA" when ready
   - Download includes complete React source code
   - Unzip and run `npm install && npm start`

### Import/Export

- **Export Config**: Download your configuration as JSON
- **Import Config**: Load a previously saved JSON configuration

## Running Locally

The app is already running in the development environment:

- **Frontend**: https://pwa-studio.preview.emergentagent.com
- **Backend API**: https://pwa-studio.preview.emergentagent.com/api

To restart services:
```bash
sudo supervisorctl restart backend frontend
```

## Database Collections

- `pwa_presets` - Stores saved PWA configurations

## Environment Variables

### Backend (.env)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `CORS_ORIGINS` - Allowed origins for CORS

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL

## Testing

Run backend tests:
```bash
cd /app && python backend_test.py
```

Test results: `/app/test_reports/iteration_1.json`
- Backend: 100% (10/10 tests passed)
- Frontend: 95% (all core functionality working)

## Next Steps - Phase 2: Public Website

The public website will include:

1. **Landing Page**
   - Marketing content
   - Pricing section
   - Feature showcase

2. **Authentication**
   - JWT-based auth
   - Google OAuth (Emergent-managed)
   - User registration/login

3. **Payment Integration**
   - Stripe paywall for editor access
   - Subscription or one-time payment
   - Payment status tracking

4. **User Features**
   - Personal dashboard
   - User-specific preset storage
   - Account settings
   - Same editor functionality (reuse components)

To build Phase 2, create a new codebase at `/app-public` with:
- Similar structure to `/app`
- Additional auth middleware
- Stripe integration (playbook provided)
- User management system
- Role-based access control

## Support

For questions or issues, refer to:
- Design guidelines: `/app/design_guidelines.json`
- Test reports: `/app/test_reports/`
- Backend logs: `/var/log/supervisor/backend.*.log`
- Frontend logs: `/var/log/supervisor/frontend.*.log`

---

**Made with Emergent** - PWA Builder Personal App v1.0
