# PWA Builder - Advanced Features Guide

## New Advanced Features (Phase 1 Enhancement)

### 1. Custom CSS Injection

Write custom CSS that will be globally applied to your generated PWA.

**Location**: Advanced Tab → Custom CSS

**Use Cases**:
- Add custom styles for specific elements
- Override default styles
- Create custom animations not in the preset list
- Apply responsive media queries
- Add custom fonts or effects

**Example**:
```css
.my-custom-class {
  background: linear-gradient(45deg, #667eea, #764ba2);
  padding: 20px;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .navbar h1 {
    font-size: 1.2rem;
  }
}
```

The custom CSS is injected at the end of the PWA's stylesheet, giving you the ability to override any default styles.

---

### 2. Animation Keyframe Editor

Create custom CSS animations with a visual editor. Define keyframes, timing, and iteration count.

**Location**: Advanced Tab → Animations

#### Animation Presets

Choose from 7 built-in animation presets:

1. **Fade In**: Opacity transition from 0 to 1
2. **Slide In Up**: Slide from bottom with fade
3. **Slide In Right**: Slide from left with fade
4. **Scale In**: Scale up from 0.8 with fade
5. **Bounce**: Bounce effect with translateY
6. **Pulse**: Pulsing scale effect
7. **Rotate**: 360-degree rotation

#### Custom Animation Properties

- **Name**: Unique identifier for your animation (e.g., `slideInUp`)
- **Keyframes**: CSS keyframe definition
  ```css
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
  ```
- **Duration**: Animation duration in milliseconds (default: 1000ms)
- **Timing Function**: Easing curves
  - linear, ease, ease-in, ease-out, ease-in-out
  - cubic-bezier curves for custom easing (bounce, anticipate)
- **Iteration**: How many times the animation runs
  - Once, Twice, 3 times, or Infinite

#### Using Animations in Your PWA

Once you create an animation, it's automatically available as a CSS class in your generated PWA:

```html
<div class=\"anim-slideInUp\">
  This element will slide in from the bottom!
</div>
```

#### Animation Workflow

1. Load a preset or create custom keyframes
2. Configure duration, timing, and iteration
3. Click "Add Animation"
4. Animation appears in "Defined Animations" list
5. Use `.anim-{animationName}` class in your PWA

---

### 3. Responsive Device Preview

Preview your PWA in different device sizes with realistic frames.

**Location**: Preview Canvas (top toolbar)

#### Device Modes

**Desktop** (Default)
- Full-width preview
- No device frame
- Best for overall layout review

**Tablet** (768 x 1024)
- iPad-style device frame
- Dark slate frame with rounded corners
- Portrait orientation

**Mobile** (375 x 667)
- iPhone-style device frame
- Compact view for mobile testing
- Portrait orientation

#### Features

- **Smooth Transitions**: Animated resize when switching devices
- **Device Frames**: Realistic dark frames around tablet/mobile views
- **Responsive Preview**: See exactly how your PWA adapts to different screen sizes
- **Quick Toggle**: One-click switching between devices

---

## Complete Feature Set

### Editor Layout
- **3-Panel Design**: Assets (left), Preview (center), Properties (right)
- **Tabbed Interface**: Switch between Properties and Advanced panels
- **Responsive Device Selector**: Desktop, Tablet, Mobile views

### Basic Properties Panel
- App name input
- Color pickers (Icon, Text, Background)
- 16 blend modes with live preview
- Transition controls (duration, fade time sliders)
- Visual FX toggles (blur, white tint)

### Advanced Panel
- **Custom CSS**: Large textarea for global CSS injection
- **Animations**: Keyframe editor with presets and custom creation

### Asset Management
- **Presets**: Save, load, delete configurations
- **Backgrounds**: Upload images with blend modes
- **Gallery**: Upload images for content
- **Audio**: Upload audio tracks

### Export Options
1. **Generate PWA**: Complete React source code (includes animations & custom CSS)
2. **Export Config**: JSON file with all settings
3. **Import Config**: Load previously saved configurations

---

## Configuration Schema (Updated)

```json
{
  \"app_name\": \"My PWA App\",
  \"icon_color\": \"#F59E0B\",
  \"text_color\": \"#FFFFFF\",
  \"background_color\": \"#000000\",
  \"background_images\": [...],
  \"background_blend_mode\": \"screen\",
  \"gallery_images\": [...],
  \"audio_tracks\": [...],
  \"pages\": [...],
  \"transitions\": {
    \"duration\": 7000,
    \"fadeTime\": 3500
  },
  \"fx_settings\": {
    \"blur\": false,
    \"whiteTint\": false
  },
  \"animations\": [
    {
      \"id\": 1642012345678,
      \"name\": \"slideInUp\",
      \"keyframes\": \"0% { transform: translateY(50px); opacity: 0; }\\n100% { transform: translateY(0); opacity: 1; }\",
      \"duration\": 1000,
      \"timing\": \"ease\",
      \"iteration\": \"once\"
    }
  ],
  \"custom_css\": \".my-class { color: red; }\"
}
```

---

## Generated PWA Structure (Enhanced)

Your generated PWA now includes:

```
my-pwa/
├── package.json
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js
│   ├── App.css          # Includes custom animations
│   ├── index.js
│   └── index.css
├── pwa-config.json      # Complete config with animations & CSS
└── README.md
```

### Enhanced App.css

The generated `App.css` now includes:

1. **Base Styles**: Default PWA styling
2. **Animation Keyframes**: All your custom animations as `@keyframes`
3. **Animation Classes**: `.anim-{name}` classes for easy use
4. **Custom CSS**: Your custom CSS injected at the end

Example:
```css
/* Custom Animations */
@keyframes slideInUp {
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.anim-slideInUp {
  animation: slideInUp 1000ms ease once;
}

/* Custom CSS */
.my-custom-class {
  background: linear-gradient(45deg, #667eea, #764ba2);
}
```

---

## Advanced Tips & Tricks

### 1. Combining Animations

Create multiple animations and chain them:
```css
/* In Custom CSS */
.hero-title {
  animation: slideInUp 1s ease, pulse 2s ease-in-out infinite;
  animation-delay: 0s, 1s;
}
```

### 2. Responsive Animations

Use custom CSS for device-specific animations:
```css
/* In Custom CSS */
@media (max-width: 768px) {
  .anim-slideInUp {
    animation-duration: 500ms; /* Faster on mobile */
  }
}
```

### 3. Animation States

Control when animations trigger:
```css
/* In Custom CSS */
.element {
  opacity: 0;
}
.element.visible {
  animation: fadeIn 1s forwards;
}
```

### 4. Complex Keyframes

Create sophisticated multi-step animations:
```
0% { 
  transform: scale(0.8) rotate(0deg); 
  opacity: 0; 
}
50% { 
  transform: scale(1.1) rotate(5deg); 
  opacity: 0.5; 
}
100% { 
  transform: scale(1) rotate(0deg); 
  opacity: 1; 
}
```

---

## Testing Workflow

1. **Design Your PWA**
   - Set colors, upload assets, configure basic properties

2. **Add Animations**
   - Use presets or create custom animations
   - Test in preview canvas

3. **Apply Custom CSS**
   - Fine-tune styles
   - Add responsive rules

4. **Test Responsive Behavior**
   - Switch between Desktop, Tablet, Mobile views
   - Verify layout adapts correctly

5. **Save Preset**
   - Save your configuration for future use

6. **Generate PWA**
   - Download complete source code
   - Deploy anywhere

---

## Browser Compatibility

### Animations
- Modern browsers: Full support for CSS animations
- Legacy browsers: Graceful degradation (no animation, but content visible)

### Device Preview
- The preview is for design purposes
- Actual PWA works on all devices regardless of preview mode used

---

## Performance Considerations

### Animations
- Use `transform` and `opacity` for best performance (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (triggers layout reflow)
- Limit infinite animations to 2-3 per page

### Custom CSS
- Minimize use of expensive CSS properties
- Test on target devices for performance
- Use media queries to disable effects on low-powered devices

---

## Keyboard Shortcuts (Editor)

- **Ctrl/Cmd + S**: Save preset
- **Ctrl/Cmd + E**: Export config
- **Ctrl/Cmd + R**: Refresh preview
- **Ctrl/Cmd + 1/2/3**: Switch device (Desktop/Tablet/Mobile)

---

## Next Steps

Explore Phase 2 features (Public Website):
- User authentication
- Stripe payment integration
- Cloud preset storage
- Team collaboration
- Advanced analytics

---

**PWA Builder Advanced Features** - Created with Emergent
