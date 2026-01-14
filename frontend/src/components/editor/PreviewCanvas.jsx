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
  
  // Text sections
  const textSections = config.text_sections || {
    title: config.app_name || 'My App',
    header: '',
    subHeader: '',
    footer: '',
    subFooter: ''
  };

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
    ${glowEffects.buttons ? `.nav-links button { box-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.6), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.4); }` : ''}
    ${glowEffects.text ? `h1, h2, h3, .title-text, .header-text { text-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.8), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.6); }` : ''}
    ${glowEffects.images ? `.gallery img, .layout-element[data-type="image"] { box-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.5), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.3); }` : ''}
    ${glowEffects.video ? `video, .layout-element[data-type="video"] { box-shadow: 0 0 ${glowIntensity}px rgba(0, 255, 200, 0.5), 0 0 ${glowIntensity * 2}px rgba(0, 200, 255, 0.3); }` : ''}
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
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: ${config.background_color};
          color: ${config.text_color};
          min-height: 100%;
          overflow: hidden;
        }

        /* Custom Animations */
        ${animationCSS}

        /* Glow Effects - Neon Blue/Green */
        ${glowCSS}

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
          transition: opacity ${config.transitions?.fadeTime || 3500}ms ease-in-out;
          mix-blend-mode: ${config.background_blend_mode || 'normal'};
        }

        .background-image.fade-out {
          opacity: 0;
        }

        /* Main Content - No Scroll */
        .content {
          position: relative;
          z-index: 5;
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow: hidden;
        }

        /* Text Sections */
        .text-section {
          text-align: center;
          margin: 0.5rem 0;
        }

        .title-text {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #00ffc8 0%, #00c8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .header-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: ${config.text_color};
          opacity: 0.9;
        }

        .sub-header-text {
          font-size: 1rem;
          color: ${config.text_color};
          opacity: 0.7;
        }

        .footer-text {
          font-size: 0.875rem;
          color: ${config.text_color};
          opacity: 0.6;
          margin-top: auto;
          padding-top: 1rem;
        }

        .sub-footer-text {
          font-size: 0.75rem;
          color: ${config.text_color};
          opacity: 0.4;
        }

        /* Media Elements */
        .video-player {
          margin: 1rem 0;
          text-align: center;
        }

        .video-player video {
          width: 100%;
          max-width: 600px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 4px 20px rgba(0, 255, 200, 0.2);
        }

        .audio-player {
          margin: 1rem 0;
          width: 100%;
          max-width: 600px;
        }

        .audio-player audio {
          width: 100%;
        }

        .gallery {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin: 1rem 0;
        }

        .gallery img {
          max-width: 200px;
          max-height: 150px;
          object-fit: contain;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem;
        }

        /* Layout Elements */
        .layout-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }

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

        .layout-element[data-type="header"] span,
        .layout-element[data-type="subHeader"] span {
          font-size: 1rem;
          font-weight: 500;
        }

        .layout-element[data-type="footer"] span,
        .layout-element[data-type="subFooter"] span {
          font-size: 0.75rem;
          opacity: 0.6;
        }

        /* Playlist */
        .playlist-container {
          max-width: 600px;
          margin: 1rem auto;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid rgba(0, 255, 200, 0.2);
        }

        .playlist-item {
          padding: 0.5rem;
          margin-bottom: 0.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.875rem;
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
              class="background-image ${idx !== 0 ? 'fade-out' : ''}" 
              style="background-image: url(${img.url})"
              data-index="${idx}"
            ></div>
          `).join('')}
        </div>
      ` : ''}

      <main class="content">
        ${layoutElements.length > 0 ? `
          <div class="layout-container">
            ${layoutElements.map(el => {
              let content = el.label || el.type;
              if (el.type === 'title') content = textSections.title || config.app_name;
              if (el.type === 'header') content = textSections.header || 'Header';
              if (el.type === 'subHeader') content = textSections.subHeader || 'Sub Header';
              if (el.type === 'footer') content = textSections.footer || 'Footer';
              if (el.type === 'subFooter') content = textSections.subFooter || 'Sub Footer';
              
              return `
                <div 
                  class="layout-element" 
                  data-type="${el.type}"
                  style="
                    left: ${el.x}px; 
                    top: ${el.y}px; 
                    width: ${el.width}px; 
                    height: ${el.height}px;
                    transform: rotate(${el.rotation || 0}deg);
                    z-index: ${el.zIndex || 0};
                  "
                >
                  <span>${content}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Default Layout when no elements -->
          ${textSections.title ? `<div class="text-section"><div class="title-text">${textSections.title}</div></div>` : ''}
          ${textSections.header ? `<div class="text-section"><div class="header-text">${textSections.header}</div></div>` : ''}
          ${textSections.subHeader ? `<div class="text-section"><div class="sub-header-text">${textSections.subHeader}</div></div>` : ''}
          
          ${videoTracks.length > 0 ? `
            <div class="video-player">
              <video id="main-video" controls>
                <source src="${videoTracks[0].url}" type="video/mp4">
              </video>
              ${videoTracks.length > 1 ? `
                <div class="playlist-container">
                  ${videoTracks.map((video, idx) => `
                    <div class="playlist-item ${idx === 0 ? 'active' : ''}" onclick="playVideo(${idx})">
                      ${idx + 1}. ${video.title}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${audioTracks.length > 0 ? `
            <div class="audio-player">
              <audio id="main-audio" controls>
                <source src="${audioTracks[0].url}" type="audio/mpeg">
              </audio>
              ${audioTracks.length > 1 ? `
                <div class="playlist-container">
                  ${audioTracks.map((audio, idx) => `
                    <div class="playlist-item ${idx === 0 ? 'active' : ''}" onclick="playAudio(${idx})">
                      ${idx + 1}. ${audio.title}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${galleryImages.length > 0 ? `
            <div class="gallery">
              ${galleryImages.map((img, idx) => `
                <img src="${img.url}" alt="${img.name || 'Image ' + (idx + 1)}" />
              `).join('')}
            </div>
          ` : ''}

          ${textSections.footer ? `<div class="text-section"><div class="footer-text">${textSections.footer}</div></div>` : ''}
          ${textSections.subFooter ? `<div class="text-section"><div class="sub-footer-text">${textSections.subFooter}</div></div>` : ''}
        `}
      </main>

      <script>
        // Background rotation
        ${bgImages.length > 1 ? `
          let currentBgIndex = 0;
          const bgImages = document.querySelectorAll('.background-image');
          const duration = ${config.transitions?.duration || 7000};

          setInterval(() => {
            bgImages[currentBgIndex].classList.add('fade-out');
            currentBgIndex = (currentBgIndex + 1) % bgImages.length;
            bgImages[currentBgIndex].classList.remove('fade-out');
          }, duration);
        ` : ''}

        // Video playlist
        ${videoTracks.length > 1 ? `
          const videos = ${JSON.stringify(videoTracks)};
          function playVideo(index) {
            const videoElement = document.getElementById('main-video');
            videoElement.src = videos[index].url;
            videoElement.play();
            
            document.querySelectorAll('.video-player .playlist-item').forEach((item, idx) => {
              item.classList.toggle('active', idx === index);
            });
          }
        ` : ''}

        // Audio playlist
        ${audioTracks.length > 1 ? `
          const audios = ${JSON.stringify(audioTracks)};
          function playAudio(index) {
            const audioElement = document.getElementById('main-audio');
            audioElement.src = audios[index].url;
            audioElement.play();
            
            document.querySelectorAll('.audio-player .playlist-item').forEach((item, idx) => {
              item.classList.toggle('active', idx === index);
            });
          }
        ` : ''}
      </script>
    </body>
    </html>
  `;
}
