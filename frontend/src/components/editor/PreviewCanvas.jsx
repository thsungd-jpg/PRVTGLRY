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
        background: 'white',
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

  // Generate animation keyframes
  const animationCSS = animations.map(anim => `
    @keyframes ${anim.name} {
      ${anim.keyframes}
    }
    .anim-${anim.name} {
      animation: ${anim.name} ${anim.duration}ms ${anim.timing} ${anim.iteration};
    }
  `).join('\n');

  // Generate glow CSS
  const glowIntensity = glowEffects.intensity || 20;
  const glowCSS = `
    ${glowEffects.buttons ? `.nav-links button { box-shadow: 0 0 ${glowIntensity}px currentColor; }` : ''}
    ${glowEffects.text ? `h1, h2, h3 { text-shadow: 0 0 ${glowIntensity}px currentColor; }` : ''}
    ${glowEffects.images ? `.gallery img { box-shadow: 0 0 ${glowIntensity}px rgba(255,255,255,0.5); }` : ''}
    ${glowEffects.video ? `video { box-shadow: 0 0 ${glowIntensity}px rgba(255,255,255,0.5); }` : ''}
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

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: ${config.background_color};
          color: ${config.text_color};
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Custom Animations */
        ${animationCSS}

        /* Glow Effects */
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
          mix-blend-mode: ${config.background_blend_mode};
        }

        .background-image.fade-out {
          opacity: 0;
        }

        .navbar {
          position: relative;
          z-index: 10;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
        }

        .navbar h1 {
          font-size: 1.5rem;
          font-weight: bold;
          color: ${config.icon_color};
        }

        .nav-links {
          display: flex;
          gap: 1rem;
        }

        .nav-links button {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: ${config.text_color};
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .nav-links button:hover,
        .nav-links button.active {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${config.icon_color};
        }

        .content {
          position: relative;
          z-index: 5;
          padding: 3rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .content h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .video-player {
          margin-top: 2rem;
          text-align: center;
        }

        .video-player h3 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .video-player video {
          width: 100%;
          max-width: 800px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          margin-bottom: 1rem;
        }

        .playlist-container {
          max-width: 800px;
          margin: 2rem auto;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
        }

        .playlist-item {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .playlist-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .playlist-item.active {
          background: rgba(${parseInt(config.icon_color.slice(1, 3), 16)}, ${parseInt(config.icon_color.slice(3, 5), 16)}, ${parseInt(config.icon_color.slice(5, 7), 16)}, 0.2);
          border-left: 3px solid ${config.icon_color};
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .gallery img {
          width: 100%;
          height: 250px;
          object-fit: contain;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
        }

        /* Video Player */
        .video-player {
          margin-top: 2rem;
          max-width: 100%;
        }

        .video-player video {
          width: 100%;
          max-width: 800px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.5);
        }

        .layout-container {
          position: relative;
          min-height: 600px;
          margin-top: 2rem;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 2rem;
        }

        /* Layout Elements */
        .layout-element {
          position: absolute;
          border: 2px solid rgba(${parseInt(config.icon_color.slice(1, 3), 16)}, ${parseInt(config.icon_color.slice(3, 5), 16)}, ${parseInt(config.icon_color.slice(5, 7), 16)}, 0.3);
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          padding: 0.5rem;
          text-align: center;
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

      <nav class="navbar">
        <h1>${config.app_name}</h1>
        <div class="nav-links">
          ${pages.map((page, idx) => `
            <button class="${idx === 0 ? 'active' : ''}" data-page="${page.id}">
              ${page.title}
            </button>
          `).join('')}
        </div>
      </nav>

      <main class="content">
        <h2>Welcome to ${config.app_name}</h2>
        
        ${videoTracks.length > 0 ? `
          <div class="video-player">
            <h3>Videos</h3>
            <video id="main-video" controls>
              <source src="${videoTracks[0].url}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <p id="current-video-title">${videoTracks[0].title}</p>
            
            ${videoTracks.length > 1 ? `
              <div class="playlist-container">
                <h4 style="margin-bottom: 1rem; color: ${config.icon_color};">Playlist</h4>
                ${videoTracks.map((video, idx) => `
                  <div class="playlist-item ${idx === 0 ? 'active' : ''}" onclick="playVideo(${idx})">
                    <strong>${idx + 1}.</strong> ${video.title}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${audioTracks.length > 0 ? `
          <div class="video-player">
            <h3>Audio</h3>
            <audio id="main-audio" controls style="width: 100%; max-width: 800px;">
              <source src="${audioTracks[0].url}" type="audio/mpeg">
              Your browser does not support the audio tag.
            </audio>
            <p id="current-audio-title">${audioTracks[0].title}</p>
            
            ${audioTracks.length > 1 ? `
              <div class="playlist-container">
                <h4 style="margin-bottom: 1rem; color: ${config.icon_color};">Playlist</h4>
                ${audioTracks.map((audio, idx) => `
                  <div class="playlist-item ${idx === 0 ? 'active' : ''}" onclick="playAudio(${idx})">
                    <strong>${idx + 1}.</strong> ${audio.title}
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
        
        ${layoutElements.length > 0 ? `
          <div class="layout-container">
            ${layoutElements.map(el => `
              <div 
                class="layout-element" 
                style="
                  left: ${el.x}px; 
                  top: ${el.y}px; 
                  width: ${el.width}px; 
                  height: ${el.height}px;
                  transform: rotate(${el.rotation || 0}deg);
                  z-index: ${el.zIndex || 0};
                "
              >
                ${el.type}
              </div>
            `).join('')}
          </div>
        ` : ''}
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

        // Page navigation
        const navButtons = document.querySelectorAll('.nav-links button');
        navButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });

        // Video playlist
        ${videoTracks.length > 1 ? `
          const videos = ${JSON.stringify(videoTracks)};
          function playVideo(index) {
            const videoElement = document.getElementById('main-video');
            const titleElement = document.getElementById('current-video-title');
            videoElement.src = videos[index].url;
            titleElement.textContent = videos[index].title;
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
            const titleElement = document.getElementById('current-audio-title');
            audioElement.src = audios[index].url;
            titleElement.textContent = audios[index].title;
            audioElement.play();
            
            document.querySelectorAll('.video-player .playlist-item').forEach((item, idx) => {
              item.classList.toggle('active', idx === index);
            });
          }
        ` : ''}
      </script>
    </body>
    </html>
  `;
}