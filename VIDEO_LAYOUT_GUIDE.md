# PWA Builder - Video & Layout Features Guide

## New Professional Features

### 1. Video Player Integration

Upload and manage video content with full HTML5 video player support.

**Location**: Asset Panel → Video Tab

#### Video Management Features
- **Upload Videos**: Support for MP4, WebM, and other HTML5-compatible formats
- **Base64 Storage**: Videos stored directly in config for portability
- **Track Management**: Add, view, and remove video tracks
- **Title Management**: Automatic title extraction from filename

#### Using Videos in Your PWA

Videos are automatically rendered in your PWA with:
- HTML5 video controls (play, pause, volume, fullscreen)
- Responsive sizing (max-width: 800px)
- Professional styling with shadows and rounded corners
- Title display below each video

**Preview**: Videos appear in the preview canvas with full playback controls.

**Generated PWA**: Complete video player implementation with:
```javascript
<video controls>
  <source src={videoUrl} type=\"video/mp4\" />
  Your browser does not support the video tag.
</video>
```

#### Video Styling

Generated PWAs include professional video player CSS:
```css
.video-player {
  margin-top: 2rem;
  text-align: center;
}

.video-player video {
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

---

### 2. Advanced Layout Editor

Precision layout control with snap-to-grid, auto-alignment, and manual positioning.

**Location**: Right Panel → Layout Tab

#### Core Features

**1. Snap & Grid System**
- **Snap to Grid**: Toggle to enable/disable grid snapping
- **Grid Size**: Adjustable from 5px to 50px in 5px increments
- **Auto Spacing**: Automatic spacing between elements
- **Visual Grid**: Helper grid overlay (when enabled)

**2. Auto Alignment Tools**
- **Horizontal Distribution**: Evenly space elements horizontally with automatic gap calculation
- **Vertical Distribution**: Evenly space elements vertically with automatic gap calculation
- **Center Alignment**: Center all elements in the canvas

**3. Element Types**
Add and manage four types of layout elements:
- **Image**: 300x200px default, for gallery images
- **Video**: 640x360px default, for video content
- **Text**: 200x100px default, for text blocks
- **Audio**: 200x100px default, for audio players

**4. Precision Controls**

For each element, control:
- **X Position**: Horizontal position in pixels
- **Y Position**: Vertical position in pixels  
- **Width**: Element width in pixels
- **Height**: Element height in pixels
- **Rotation**: Rotation angle in degrees (0-360)
- **Z-Index**: Stacking order for overlapping elements

#### Layout Workflow

1. **Enable Snap to Grid**
   - Toggle on for precise alignment
   - Adjust grid size (10px is standard)

2. **Add Elements**
   - Click element type button (Image/Video/Text/Audio)
   - Element appears at default position (100, 100)

3. **Position Elements**
   - Adjust X, Y for position
   - Adjust Width, Height for size
   - Set Rotation for angle
   - Set Z-Index for layer order

4. **Auto-Align**
   - Use Horizontal to distribute left-to-right
   - Use Vertical to distribute top-to-bottom
   - Use Center to center all elements

5. **Preview**
   - Elements visible in canvas with borders
   - Golden amber border indicates layout elements
   - Labels show element type

#### Layout Configuration Schema

```json
{
  \"layout\": {
    \"snapEnabled\": true,
    \"snapGrid\": 10,
    \"autoSpacing\": true,
    \"elements\": [
      {
        \"id\": 1642012345678,
        \"type\": \"video\",
        \"x\": 100,
        \"y\": 100,
        \"width\": 640,
        \"height\": 360,
        \"rotation\": 0,
        \"zIndex\": 0
      }
    ]
  }
}
```

#### Generated PWA Layout Rendering

Layout elements are rendered with absolute positioning:

```jsx
<div style={{ 
  position: 'relative', 
  minHeight: '600px',
  border: '1px dashed rgba(255,255,255,0.2)',
  borderRadius: '8px'
}}>
  {layoutElements.map((el) => (
    <div style={{
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      transform: `rotate(${el.rotation}deg)`,
      zIndex: el.zIndex
    }}>
      {/* Element content */}
    </div>
  ))}
</div>
```

---

## Complete Feature Matrix

### Asset Management
| Feature | Supported | Notes |
|---------|-----------|-------|
| Background Images | ✅ | With blend modes |
| Gallery Images | ✅ | Grid display |
| Video Tracks | ✅ | HTML5 player |
| Audio Tracks | ✅ | Custom controls |

### Layout Controls
| Feature | Supported | Notes |
|---------|-----------|-------|
| Snap to Grid | ✅ | 5-50px grid |
| Auto Spacing | ✅ | Automatic gaps |
| Horizontal Align | ✅ | Even distribution |
| Vertical Align | ✅ | Even distribution |
| Center Align | ✅ | Center all |
| Manual Position | ✅ | X, Y controls |
| Size Control | ✅ | W, H controls |
| Rotation | ✅ | 0-360° |
| Z-Index | ✅ | Layer stacking |

### Advanced Features
| Feature | Supported | Notes |
|---------|-----------|-------|
| Custom CSS | ✅ | Global injection |
| Animations | ✅ | 7 presets + custom |
| Device Preview | ✅ | Desktop/Tablet/Mobile |
| Responsive | ✅ | All viewports |

---

## Advanced Use Cases

### 1. Video Gallery Layout

Create a video gallery with precise positioning:

```
1. Add 3 video elements
2. Set positions:
   - Video 1: X=50, Y=50, W=640, H=360
   - Video 2: X=750, Y=50, W=640, H=360
   - Video 3: X=400, Y=470, W=640, H=360
3. Use \"Center\" alignment to center the layout
4. Preview shows professional video grid
```

### 2. Mixed Media Layout

Combine images, videos, and text:

```
1. Add 1 video element (center, top)
2. Add 2 image elements (left and right of video)
3. Add 1 text element (below video)
4. Use \"Horizontal\" alignment for images
5. Use \"Vertical\" alignment for all elements
6. Adjust individual sizes for visual hierarchy
```

### 3. Rotating Elements

Create dynamic layouts with rotation:

```
1. Add text element
2. Set rotation to 45° for diagonal text
3. Add image elements at 0°, 90°, 180°, 270°
4. Create mandala-style layout
5. Use Z-Index to control overlap
```

### 4. Layered Composition

Build complex overlays:

```
1. Add large background image (Z-Index: 0)
2. Add video overlay (Z-Index: 1, semi-transparent)
3. Add text overlay (Z-Index: 2)
4. Add small image corner element (Z-Index: 3)
5. Preview shows layered composition
```

---

## Best Practices

### Video Optimization
- **File Size**: Keep videos under 50MB for best performance
- **Format**: Use MP4 with H.264 codec for maximum compatibility
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD) recommended
- **Duration**: Shorter videos (< 2 minutes) work best for web

### Layout Design
- **Grid Size**: 
  - 10px for general layouts
  - 5px for precise adjustments
  - 20px+ for quick rough layouts
- **Spacing**: Use auto-spacing for consistent gaps
- **Alignment**: Start with auto-align, then fine-tune manually
- **Z-Index**: Reserve high values (90-100) for popups/overlays

### Performance Considerations
- **Element Count**: Keep layout elements under 20 for optimal performance
- **Video Count**: Limit to 2-3 videos per page
- **Total Assets**: Monitor total file size (aim for < 100MB total)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl/Cmd + S** | Save preset |
| **Ctrl/Cmd + E** | Export config |
| **Ctrl/Cmd + R** | Refresh preview |
| **Ctrl/Cmd + 1/2/3** | Switch device view |
| **Ctrl/Cmd + L** | Toggle Layout tab |
| **Ctrl/Cmd + A** | Toggle Advanced tab |

---

## Troubleshooting

### Video Not Playing
**Problem**: Video shows in preview but doesn't play  
**Solution**: Check video format (MP4 H.264 recommended), browser compatibility

### Layout Elements Not Visible
**Problem**: Added elements but can't see them in preview  
**Solution**: Check X, Y positions (must be within canvas bounds: 0-1000px width, 0-800px height)

### Snap Not Working
**Problem**: Elements not snapping to grid  
**Solution**: Ensure \"Snap to Grid\" toggle is enabled, adjust grid size if needed

### Auto-Align Overlapping
**Problem**: Auto-align creates overlapping elements  
**Solution**: Reduce element sizes first, or manually adjust after auto-align

---

## API Reference

### Video Upload Endpoint

```http
POST /api/upload/video
Content-Type: multipart/form-data

Response:
{
  \"url\": \"data:video/mp4;base64,...\",
  \"name\": \"video.mp4\",
  \"type\": \"video/mp4\"
}
```

### Config Structure (Extended)

```json
{
  \"app_name\": \"My PWA\",
  \"video_tracks\": [
    {
      \"url\": \"data:video/mp4;base64,...\",
      \"name\": \"video.mp4\",
      \"title\": \"My Video\"
    }
  ],
  \"layout\": {
    \"snapEnabled\": true,
    \"snapGrid\": 10,
    \"autoSpacing\": true,
    \"elements\": [
      {
        \"id\": 1642012345678,
        \"type\": \"video|image|text|audio\",
        \"x\": 100,
        \"y\": 100,
        \"width\": 640,
        \"height\": 360,
        \"rotation\": 0,
        \"zIndex\": 0
      }
    ]
  }
}
```

---

## Future Enhancements

### Video Features (Roadmap)
- Video trimming/editing
- Custom thumbnails
- Playback speed control
- Subtitle support

### Layout Features (Roadmap)
- Drag-and-drop positioning
- Visual grid overlay
- Element grouping
- Alignment guides (smart guides)
- Copy/paste elements
- Element templates

---

**PWA Builder - Video & Layout Edition** - Created with Emergent
