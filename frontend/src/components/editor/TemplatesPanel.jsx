import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout, Check } from 'lucide-react';
import { toast } from 'sonner';

// Template definitions based on uploaded images and variations
const layoutTemplates = [
  {
    id: 'slideshow-sidebar',
    name: 'Slideshow + Sidebar',
    description: 'Large slideshow with narrative text sidebar',
    thumbnail: 'https://customer-assets.emergentagent.com/job_7e0cf6fc-cd10-443f-a242-602fb0a9780a/artifacts/a0h0imjn_7.png',
    orientation: 'horizontal',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'image', x: 50, y: 150, width: 600, height: 400, label: 'Slideshow' },
      { type: 'text', x: 680, y: 150, width: 270, height: 400, label: 'Narrative' },
      { type: 'audio', x: 50, y: 580, width: 900, height: 80, label: 'Audio Player' }
    ]
  },
  {
    id: 'video-sidebar',
    name: 'Video + Sidebar',
    description: 'Central video with narrative text',
    thumbnail: 'https://customer-assets.emergentagent.com/job_7e0cf6fc-cd10-443f-a242-602fb0a9780a/artifacts/a2hbq5ac_8.png',
    orientation: 'horizontal',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'text', x: 50, y: 150, width: 250, height: 400, label: 'Narrative' },
      { type: 'video', x: 330, y: 150, width: 620, height: 400, label: 'Video Player' },
      { type: 'audio', x: 50, y: 580, width: 900, height: 80, label: 'Audio Player' }
    ]
  },
  {
    id: 'centered-slideshow',
    name: 'Centered Slideshow',
    description: 'Simple vertical layout with centered slideshow',
    thumbnail: 'https://customer-assets.emergentagent.com/job_7e0cf6fc-cd10-443f-a242-602fb0a9780a/artifacts/nza5ns0w_9.png',
    orientation: 'vertical',
    elements: [
      { type: 'text', x: 100, y: 50, width: 800, height: 80, label: 'Title' },
      { type: 'image', x: 100, y: 150, width: 800, height: 450, label: 'Slideshow' },
      { type: 'audio', x: 100, y: 630, width: 800, height: 80, label: 'Audio Player' }
    ]
  },
  {
    id: 'video-description',
    name: 'Video + Description',
    description: 'Large video with description below',
    thumbnail: 'https://customer-assets.emergentagent.com/job_7e0cf6fc-cd10-443f-a242-602fb0a9780a/artifacts/d8zr6pns_10.png',
    orientation: 'vertical',
    elements: [
      { type: 'text', x: 100, y: 50, width: 800, height: 80, label: 'Title' },
      { type: 'video', x: 100, y: 150, width: 800, height: 450, label: 'Video' },
      { type: 'text', x: 100, y: 630, width: 800, height: 120, label: 'Description' }
    ]
  },
  {
    id: 'gallery-grid',
    name: 'Gallery Grid',
    description: '2x2 image grid layout',
    orientation: 'grid',
    elements: [
      { type: 'text', x: 100, y: 50, width: 800, height: 80, label: 'Title' },
      { type: 'image', x: 100, y: 150, width: 380, height: 250, label: 'Image 1' },
      { type: 'image', x: 520, y: 150, width: 380, height: 250, label: 'Image 2' },
      { type: 'image', x: 100, y: 430, width: 380, height: 250, label: 'Image 3' },
      { type: 'image', x: 520, y: 430, width: 380, height: 250, label: 'Image 4' }
    ]
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Side-by-side video and images',
    orientation: 'horizontal',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'video', x: 50, y: 150, width: 430, height: 400, label: 'Video' },
      { type: 'image', x: 520, y: 150, width: 430, height: 190, label: 'Image 1' },
      { type: 'image', x: 520, y: 360, width: 430, height: 190, label: 'Image 2' },
      { type: 'audio', x: 50, y: 580, width: 900, height: 80, label: 'Audio' }
    ]
  },
  {
    id: 'hero-video',
    name: 'Hero Video',
    description: 'Full-width video with overlaid text',
    orientation: 'vertical',
    elements: [
      { type: 'video', x: 50, y: 50, width: 900, height: 500, label: 'Hero Video' },
      { type: 'text', x: 100, y: 100, width: 800, height: 100, label: 'Overlay Title', zIndex: 10 },
      { type: 'text', x: 100, y: 570, width: 800, height: 150, label: 'Content' }
    ]
  },
  {
    id: 'masonry-layout',
    name: 'Masonry',
    description: 'Pinterest-style staggered grid',
    orientation: 'grid',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'image', x: 50, y: 150, width: 280, height: 250, label: 'Image 1' },
      { type: 'image', x: 360, y: 150, width: 280, height: 350, label: 'Image 2' },
      { type: 'image', x: 670, y: 150, width: 280, height: 200, label: 'Image 3' },
      { type: 'image', x: 50, y: 430, width: 280, height: 200, label: 'Image 4' },
      { type: 'video', x: 360, y: 530, width: 590, height: 300, label: 'Video' }
    ]
  },
  {
    id: 'sidebar-dual',
    name: 'Dual Sidebar',
    description: 'Center content with sidebars',
    orientation: 'horizontal',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'text', x: 50, y: 150, width: 200, height: 450, label: 'Left Sidebar' },
      { type: 'video', x: 280, y: 150, width: 440, height: 450, label: 'Main Video' },
      { type: 'text', x: 750, y: 150, width: 200, height: 450, label: 'Right Sidebar' },
      { type: 'audio', x: 50, y: 630, width: 900, height: 80, label: 'Audio' }
    ]
  },
  {
    id: 'magazine-layout',
    name: 'Magazine',
    description: 'Editorial-style mixed content',
    orientation: 'grid',
    elements: [
      { type: 'text', x: 50, y: 50, width: 450, height: 120, label: 'Title' },
      { type: 'text', x: 530, y: 50, width: 420, height: 120, label: 'Subtitle' },
      { type: 'image', x: 50, y: 200, width: 450, height: 300, label: 'Feature Image' },
      { type: 'text', x: 530, y: 200, width: 420, height: 300, label: 'Article Text' },
      { type: 'video', x: 50, y: 530, width: 900, height: 250, label: 'Video' }
    ]
  },
  {
    id: 'portfolio-showcase',
    name: 'Portfolio',
    description: 'Work showcase with large image',
    orientation: 'vertical',
    elements: [
      { type: 'text', x: 100, y: 50, width: 800, height: 80, label: 'Project Title' },
      { type: 'image', x: 100, y: 150, width: 800, height: 400, label: 'Hero Image' },
      { type: 'text', x: 100, y: 580, width: 380, height: 150, label: 'Description' },
      { type: 'image', x: 520, y: 580, width: 380, height: 150, label: 'Detail' }
    ]
  },
  {
    id: 'video-gallery',
    name: 'Video Gallery',
    description: 'Multiple video players',
    orientation: 'grid',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'video', x: 50, y: 150, width: 430, height: 250, label: 'Video 1' },
      { type: 'video', x: 520, y: 150, width: 430, height: 250, label: 'Video 2' },
      { type: 'video', x: 50, y: 430, width: 430, height: 250, label: 'Video 3' },
      { type: 'video', x: 520, y: 430, width: 430, height: 250, label: 'Video 4' }
    ]
  },
  {
    id: 'stacked-media',
    name: 'Stacked Media',
    description: 'Vertical media stack',
    orientation: 'vertical',
    elements: [
      { type: 'text', x: 100, y: 50, width: 800, height: 80, label: 'Title' },
      { type: 'image', x: 100, y: 150, width: 800, height: 200, label: 'Image' },
      { type: 'video', x: 100, y: 380, width: 800, height: 250, label: 'Video' },
      { type: 'text', x: 100, y: 660, width: 800, height: 100, label: 'Description' }
    ]
  },
  {
    id: 'asymmetric-grid',
    name: 'Asymmetric',
    description: 'Dynamic asymmetric layout',
    orientation: 'grid',
    elements: [
      { type: 'text', x: 50, y: 50, width: 900, height: 80, label: 'Title' },
      { type: 'video', x: 50, y: 150, width: 550, height: 350, label: 'Main Video' },
      { type: 'image', x: 630, y: 150, width: 320, height: 170, label: 'Image 1' },
      { type: 'image', x: 630, y: 350, width: 320, height: 150, label: 'Image 2' },
      { type: 'text', x: 50, y: 530, width: 900, height: 120, label: 'Content' }
    ]
  },
  {
    id: 'mobile-first',
    name: 'Mobile-First',
    description: 'Optimized for mobile/portrait',
    orientation: 'vertical',
    elements: [
      { type: 'text', x: 200, y: 50, width: 600, height: 80, label: 'Title' },
      { type: 'video', x: 200, y: 150, width: 600, height: 350, label: 'Video' },
      { type: 'text', x: 200, y: 530, width: 600, height: 100, label: 'Description' },
      { type: 'audio', x: 200, y: 660, width: 600, height: 80, label: 'Audio' }
    ]
  }
];

export default function TemplatesPanel({ onApplyTemplate }) {
  const handleApplyTemplate = (template) => {
    // Generate unique IDs for each element
    const elements = template.elements.map(el => ({
      ...el,
      id: Date.now() + Math.random(),
      zIndex: el.zIndex || 0
    }));

    onApplyTemplate({
      snapEnabled: true,
      snapGrid: 10,
      autoSpacing: true,
      elements
    });

    toast.success(`Template "${template.name}" applied!`);
  };

  const getOrientationColor = (orientation) => {
    switch (orientation) {
      case 'horizontal': return 'text-blue-400';
      case 'vertical': return 'text-green-400';
      case 'grid': return 'text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary">Layout Templates</h3>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Click any template to instantly apply the layout. Elements will be added to your canvas.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {layoutTemplates.map((template) => (
            <div
              key={template.id}
              className="control-section p-3 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => handleApplyTemplate(template)}
              data-testid={`template-${template.id}`}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                {template.thumbnail && (
                  <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden">
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{template.name}</h4>
                    <span className={`text-xs ${getOrientationColor(template.orientation)}`}>
                      {template.orientation}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{template.elements.length} elements</span>
                  </div>
                </div>

                {/* Apply indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="text-xs font-semibold text-primary mb-2">Pro Tip</h4>
          <p className="text-xs text-muted-foreground">
            After applying a template, use the Layout tab to fine-tune positions, or the Properties tab to customize colors and effects.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}