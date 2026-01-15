import React, { useEffect, useRef } from 'react';

export default function PreviewCanvas({ config }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const html = generatePreviewHTML(config);
    doc.open();
    doc.write(html);
    doc.close();
  }, [config]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: 'transparent',
        borderRadius: '8px'
      }}
      title="PWA Preview"
      sandbox="allow-scripts allow-same-origin"
      data-testid="preview-iframe"
    />
  );
}

function generatePreviewHTML(config) {
  const bgImages = config.background_images || [];
  const galleryImages = config.gallery_images || [];
  const videoTracks = config.video_tracks || [];
  const audioTracks = config.audio_tracks || [];
  const pages = config.pages || [{ id: 'home', title: 'Home' }];
  const animations = config.animations || [];
  const customCSS = config.custom_css || '';
  const layoutElements = config.layout?.elements || [];
  const glowEffects = config.glow_effects || {};
  const playerFrame = config.player_frame || 'glassmorphism';
  const slideshowSettings = config.slideshow_settings || { transition: 'fade', duration: 5000, autoPlay: true, loop: true };
  const pageTransition = config.page_transition || { type: 'fade', duration: 300 };
  const pageNavigation = config.page_navigation || { swipeEnabled: true, clickEnabled: true };
  
  const textSections = config.text_sections || {
    title: config.app_name || 'My App',
    header: '',
    subHeader: '',
    footer: '',
    subFooter: ''
  };

  // Player frame styles
  const frameStyles = {
    minimal: { borderRadius: '4px', border: 'none', boxShadow: 'none', background: 'transparent' },
    rounded: { borderRadius: '16px', border: '2px solid rgba(0,255,200,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.3)' },
    glassmorphism: { borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' },
    neon: { borderRadius: '8px', border: '2px solid #00ffc8', boxShadow: '0 0 20px rgba(0,255,200,0.4), inset 0 0 20px rgba(0,255,200,0.1)', background: 'rgba(0,0,0,0.5)' },
    retro: { borderRadius: '0', border: '4px solid #00c8ff', boxShadow: '4px 4px 0 #00ffc8', background: '#0a0a0a' },
  };
  
  const currentFrameStyle = frameStyles[playerFrame] || frameStyles.glassmorphism;

  // Generate animation keyframes
  const animationCSS = animations.map(anim => `
    @keyframes ${anim.name} {
      ${anim.keyframes}
    }
    .anim-${anim.name} {
      animation: ${anim.name} ${anim.duration}ms ${anim.timing} ${anim.iteration};
    }
  `).join('\n');

  // Generate glow CSS with neon blue/green gradient
  const glowIntensity = glowEffects.intensity || 20;
  const glowCSS = `
    ${glowEffects.buttons ? `.btn { box-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.6), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.4); }` : ''}
    ${glowEffects.text ? `h1, h2, h3, .title-text, .header-text { text-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.8), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.6); }` : ''}
    ${glowEffects.images ? `img, .layout-element[data-type="image"] { box-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.5), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.3); }` : ''}
    ${glowEffects.video ? `video, .layout-element[data-type="video"] { box-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.5), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.3); }` : ''}
  `;

  // Slideshow transition CSS
  const slideshowTransitionCSS = `
    .slideshow-item {
      transition: all ${slideshowSettings.duration / 10}ms ease-in-out;
    }
    .slideshow-item.fade-out { opacity: 0; }
    .slideshow-item.slide-left { transform: translateX(-100%); }
    .slideshow-item.slide-right { transform: translateX(100%); }
    .slideshow-item.slide-up { transform: translateY(-100%); }
    .slideshow-item.slide-down { transform: translateY(100%); }
    .slideshow-item.zoom-in { transform: scale(1.2); opacity: 0; }
    .slideshow-item.zoom-out { transform: scale(0.8); opacity: 0; }
  `;

  // Page transition CSS
  const pageTransitionCSS = `
    .page {
      transition: all ${pageTransition.duration}ms ease-in-out;
    }
    .page.hidden { display: none; }
    .page.fade-out { opacity: 0; }
    .page.slide-left { transform: translateX(-100%); }
    .page.slide-right { transform: translateX(100%); }
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.app_name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          overflow: hidden;
          height: 100%;
          width: 100%;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: ${config.background_color};
          color: ${config.text_color};
          overflow: hidden;
        }

        /* Custom Animations */
        ${animationCSS}

        /* Glow Effects */
        ${glowCSS}

        /* Slideshow Transitions */
        ${slideshowTransitionCSS}

        /* Page Transitions */
        ${pageTransitionCSS}

        .background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .background-image {
          position: absolute;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: opacity ${slideshowSettings.duration / 2}ms ease-in-out;
          mix-blend-mode: ${config.background_blend_mode || 'normal'};
        }

        .background-image.fade-out {
          opacity: 0;
        }

        /* Main Content */
        .content {
          position: relative;
          z-index: 5;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
        }

        /* Layout Container - fills available space */
        .layout-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Layout Elements */
        .layout-element {
          position: absolute;
          border: 2px solid rgba(0, 255, 200, 0.3);
          background: rgba(0, 200, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          padding: 0.5rem;
          text-align: center;
          backdrop-filter: blur(4px);
          overflow: hidden;
        }

        .layout-element[data-type="title"] {
          background: transparent;
          border: none;
        }

        .layout-element[data-type="title"] span {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00ffc8 0%, #00c8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .layout-element[data-type="header"] span {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .layout-element[data-type="subHeader"] span {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .layout-element[data-type="footer"] span,
        .layout-element[data-type="subFooter"] span {
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .layout-element[data-type="text"] {
          font-size: 0.8rem;
          line-height: 1.4;
        }

        /* Media elements */
        .layout-element img,
        .layout-element video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
        }

        .layout-element audio {
          width: 90%;
        }

        /* Player Frame Styles */
        .player-frame {
          border-radius: ${currentFrameStyle.borderRadius};
          border: ${currentFrameStyle.border};
          box-shadow: ${currentFrameStyle.boxShadow};
          background: ${currentFrameStyle.background};
          ${currentFrameStyle.backdropFilter ? `backdrop-filter: ${currentFrameStyle.backdropFilter};` : ''}
          overflow: hidden;
        }

        /* Fallback content when no layout elements */
        .fallback-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          text-align: center;
        }

        .fallback-content .title-text {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #00ffc8 0%, #00c8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .fallback-content .header-text {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .fallback-content .sub-header-text {
          font-size: 1rem;
          opacity: 0.7;
          margin-bottom: 1rem;
        }

        .media-container {
          width: 100%;
          max-width: 500px;
          margin: 1rem 0;
        }

        .media-container video,
        .media-container audio {
          width: 100%;
          border-radius: ${currentFrameStyle.borderRadius};
        }

        .footer-text {
          margin-top: auto;
          padding-top: 1rem;
          font-size: 0.875rem;
          opacity: 0.6;
        }

        .sub-footer-text {
          font-size: 0.75rem;
          opacity: 0.4;
        }

        /* Playlist */
        .playlist {
          width: 100%;
          max-width: 500px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 0.5rem;
          margin-top: 0.5rem;
        }

        .playlist-item {
          padding: 0.5rem;
          margin: 0.25rem 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: background 0.2s;
        }

        .playlist-item:hover {
          background: rgba(0, 255, 200, 0.1);
        }

        .playlist-item.active {
          background: rgba(0, 255, 200, 0.2);
          border-left: 3px solid #00ffc8;
        }

        /* Custom CSS */
        ${customCSS}
      </style>
    </head>
    <body>
      ${bgImages.length > 0 ? `
        <div class="background-container" id="bg-container">
          ${bgImages.map((img, idx) => `
            <div 
              class="background-image slideshow-item ${idx !== 0 ? 'fade-out' : ''}" 
              style="background-image: url(${img.url})"
              data-index="${idx}"
            ></div>
          `).join('')}
        </div>
      ` : ''}

      <main class="content">
        ${layoutElements.length > 0 ? `
          <div class="layout-container">
            ${layoutElements.filter(el => !el.hidden).map(el => {
              let content = el.label || el.type;
              
              // Get text section content
              if (el.type === 'title') content = textSections.title || config.app_name || 'Title';
              if (el.type === 'header') content = textSections.header || el.label || 'Header';
              if (el.type === 'subHeader') content = textSections.subHeader || el.label || 'Sub Header';
              if (el.type === 'footer') content = textSections.footer || el.label || 'Footer';
              if (el.type === 'subFooter') content = textSections.subFooter || el.label || 'Sub Footer';
              
              // Render media elements
              let mediaContent = '';
              if (el.mediaUrl) {
                if (el.type === 'image') {
                  mediaContent = `<img src="${el.mediaUrl}" alt="${el.label}" />`;
                } else if (el.type === 'video') {
                  mediaContent = `<video src="${el.mediaUrl}" controls class="player-frame"></video>`;
                } else if (el.type === 'audio') {
                  mediaContent = `<audio src="${el.mediaUrl}" controls class="player-frame"></audio>`;
                }
              } else if (el.type === 'image' && galleryImages.length > 0) {
                const imgIndex = layoutElements.filter(e => e.type === 'image').indexOf(el);
                const img = galleryImages[imgIndex % galleryImages.length];
                if (img) {
                  mediaContent = `<img src="${img.url}" alt="${img.name}" />`;
                }
              } else if (el.type === 'video' && videoTracks.length > 0) {
                const vidIndex = layoutElements.filter(e => e.type === 'video').indexOf(el);
                const vid = videoTracks[vidIndex % videoTracks.length];
                if (vid) {
                  mediaContent = `<video src="${vid.url}" controls class="player-frame"></video>`;
                }
              } else if (el.type === 'audio' && audioTracks.length > 0) {
                const audIndex = layoutElements.filter(e => e.type === 'audio').indexOf(el);
                const aud = audioTracks[audIndex % audioTracks.length];
                if (aud) {
                  mediaContent = `<audio src="${aud.url}" controls class="player-frame"></audio>`;
                }
              }
              
              return `
                <div 
                  class="layout-element ${el.type === 'video' || el.type === 'audio' ? 'player-frame' : ''}" 
                  data-type="${el.type}"
                  style="
                    left: ${el.x}px; 
                    top: ${el.y}px; 
                    width: ${el.width}px; 
                    height: ${el.height}px;
                    transform: rotate(${el.rotation || 0}deg) scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1});
                    z-index: ${el.zIndex || 0};
                  "
                >
                  ${mediaContent || `<span>${content}</span>`}
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Fallback content when no layout elements -->
          <div class="fallback-content">
            ${textSections.title ? `<div class="title-text">${textSections.title}</div>` : ''}
            ${textSections.header ? `<div class="header-text">${textSections.header}</div>` : ''}
            ${textSections.subHeader ? `<div class="sub-header-text">${textSections.subHeader}</div>` : ''}
            
            ${videoTracks.length > 0 ? `
              <div class="media-container player-frame">
                <video id="main-video" controls>
                  <source src="${videoTracks[0].url}" type="video/mp4">
                </video>
                ${videoTracks.length > 1 ? `
                  <div class="playlist">
                    ${videoTracks.map((v, i) => `
                      <div class="playlist-item ${i === 0 ? 'active' : ''}" onclick="playVideo(${i})">${i + 1}. ${v.title}</div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${audioTracks.length > 0 ? `
              <div class="media-container player-frame">
                <audio id="main-audio" controls>
                  <source src="${audioTracks[0].url}" type="audio/mpeg">
                </audio>
                ${audioTracks.length > 1 ? `
                  <div class="playlist">
                    ${audioTracks.map((a, i) => `
                      <div class="playlist-item ${i === 0 ? 'active' : ''}" onclick="playAudio(${i})">${i + 1}. ${a.title}</div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${galleryImages.length > 0 ? `
              <div class="media-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                ${galleryImages.slice(0, 4).map(img => `
                  <img src="${img.url}" alt="${img.name}" style="max-width: 120px; max-height: 100px; object-fit: cover; border-radius: 8px;" />
                `).join('')}
              </div>
            ` : ''}

            ${textSections.footer ? `<div class="footer-text">${textSections.footer}</div>` : ''}
            ${textSections.subFooter ? `<div class="sub-footer-text">${textSections.subFooter}</div>` : ''}
          </div>
        `}
      </main>

      <script>
        // Background slideshow
        ${bgImages.length > 1 && slideshowSettings.autoPlay ? `
          let currentBgIndex = 0;
          const bgElements = document.querySelectorAll('.background-image');
          const slideDuration = ${slideshowSettings.duration};
          const transition = '${slideshowSettings.transition}';

          setInterval(() => {
            bgElements[currentBgIndex].classList.add('fade-out');
            currentBgIndex = ${slideshowSettings.loop ? '(currentBgIndex + 1) % bgElements.length' : 'Math.min(currentBgIndex + 1, bgElements.length - 1)'};
            bgElements[currentBgIndex].classList.remove('fade-out');
          }, slideDuration);
        ` : ''}

        // Video playlist
        ${videoTracks.length > 1 ? `
          const videos = ${JSON.stringify(videoTracks)};
          function playVideo(index) {
            const video = document.getElementById('main-video');
            if (video) {
              video.src = videos[index].url;
              video.play();
              document.querySelectorAll('.playlist-item').forEach((item, idx) => {
                item.classList.toggle('active', idx === index);
              });
            }
          }
        ` : ''}

        // Audio playlist
        ${audioTracks.length > 1 ? `
          const audios = ${JSON.stringify(audioTracks)};
          function playAudio(index) {
            const audio = document.getElementById('main-audio');
            if (audio) {
              audio.src = audios[index].url;
              audio.play();
              document.querySelectorAll('.playlist-item').forEach((item, idx) => {
                item.classList.toggle('active', idx === index);
              });
            }
          }
        ` : ''}

        // Page navigation
        ${pageNavigation.swipeEnabled ? `
          let touchStartX = 0;
          let touchEndX = 0;
          
          document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
          });
          
          document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
              // Swipe detected - would navigate pages
              console.log(diff > 0 ? 'Swipe left' : 'Swipe right');
            }
          });
        ` : ''}
      </script>
    </body>
    </html>
  `;
}
