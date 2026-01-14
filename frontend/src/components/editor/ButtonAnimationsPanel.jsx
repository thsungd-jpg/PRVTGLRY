import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MousePointer2 } from 'lucide-react';

const buttonAnimations = [
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Gentle pulsing scale effect',
    css: '.btn-pulse:hover { animation: pulse 1s infinite; }\n@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }'
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'Bouncing hover effect',
    css: '.btn-bounce:hover { animation: bounce 0.5s; }\n@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }'
  },
  {
    id: 'shake',
    name: 'Shake',
    description: 'Horizontal shake',
    css: '.btn-shake:hover { animation: shake 0.5s; }\n@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }'
  },
  {
    id: 'rotate',
    name: 'Rotate',
    description: 'Spin on hover',
    css: '.btn-rotate:hover { animation: rotate 0.5s; }\n@keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    description: 'Slide to the right',
    css: '.btn-slide-right:hover { transform: translateX(5px); transition: transform 0.3s ease; }'
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    description: 'Lift upwards',
    css: '.btn-slide-up:hover { transform: translateY(-5px); transition: transform 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }'
  },
  {
    id: 'glow',
    name: 'Glow',
    description: 'Glowing border effect',
    css: '.btn-glow:hover { box-shadow: 0 0 20px rgba(245, 158, 11, 0.6); transition: box-shadow 0.3s ease; }'
  },
  {
    id: 'fill',
    name: 'Fill',
    description: 'Background fill from left',
    css: '.btn-fill { position: relative; overflow: hidden; }\n.btn-fill::before { content: ""; position: absolute; left: 0; top: 0; width: 0; height: 100%; background: rgba(245, 158, 11, 0.2); transition: width 0.3s ease; z-index: -1; }\n.btn-fill:hover::before { width: 100%; }'
  },
  {
    id: 'border-grow',
    name: 'Border Grow',
    description: 'Growing border on hover',
    css: '.btn-border-grow { border: 2px solid transparent; transition: border-color 0.3s ease; }\n.btn-border-grow:hover { border-color: #F59E0B; }'
  },
  {
    id: 'shadow-drop',
    name: 'Shadow Drop',
    description: 'Dropping shadow effect',
    css: '.btn-shadow-drop { transition: box-shadow 0.3s ease, transform 0.3s ease; }\n.btn-shadow-drop:hover { transform: translateY(2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }'
  },
  {
    id: 'scale-in',
    name: 'Scale In',
    description: 'Scale down on hover',
    css: '.btn-scale-in:hover { transform: scale(0.95); transition: transform 0.2s ease; }'
  },
  {
    id: 'scale-out',
    name: 'Scale Out',
    description: 'Scale up on hover',
    css: '.btn-scale-out:hover { transform: scale(1.1); transition: transform 0.2s ease; }'
  },
  {
    id: 'flip-x',
    name: 'Flip Horizontal',
    description: 'Flip along X-axis',
    css: '.btn-flip-x:hover { animation: flipX 0.6s; }\n@keyframes flipX { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(360deg); } }'
  },
  {
    id: 'flip-y',
    name: 'Flip Vertical',
    description: 'Flip along Y-axis',
    css: '.btn-flip-y:hover { animation: flipY 0.6s; }\n@keyframes flipY { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }'
  },
  {
    id: 'ripple',
    name: 'Ripple',
    description: 'Ripple wave effect',
    css: '.btn-ripple { position: relative; overflow: hidden; }\n.btn-ripple::after { content: ""; position: absolute; width: 100%; height: 100%; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); border-radius: 50%; background: rgba(255,255,255,0.3); }\n.btn-ripple:hover::after { animation: ripple 0.6s; }\n@keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(4); opacity: 0; } }'
  }
];

export default function ButtonAnimationsPanel({ config, updateConfig }) {
  const addButtonAnimation = (animation) => {
    const currentCSS = config.custom_css || '';
    const newCSS = currentCSS + '\n\n/* Button Animation: ' + animation.name + ' */\n' + animation.css;
    
    updateConfig('custom_css', newCSS);
    toast.success(`${animation.name} animation added to Custom CSS!`);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <MousePointer2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary">Button Animations</h3>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Click any animation to add its CSS to your custom styles. Apply the class name to your buttons in the generated PWA.
        </p>

        <div className="space-y-2">
          {buttonAnimations.map((animation) => (
            <div
              key={animation.id}
              className="control-section p-3 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => addButtonAnimation(animation)}
              data-testid={`btn-animation-${animation.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">{animation.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {animation.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      .btn-{animation.id}
                    </code>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    addButtonAnimation(animation);
                  }}
                >
                  Add
                </Button>
              </div>

              {/* Preview */}
              <div className="mt-3 flex items-center justify-center">
                <div 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium cursor-pointer"
                  style={{ animation: animation.id === 'pulse' ? 'pulse 1s infinite' : 'none' }}
                >
                  Hover Preview
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="text-xs font-semibold text-primary mb-2">Usage</h4>
          <p className="text-xs text-muted-foreground mb-2">
            After adding an animation, apply the class to your buttons:
          </p>
          <code className="text-xs bg-muted block p-2 rounded">
            {'<button className="btn-pulse">Click Me</button>'}
          </code>
        </div>
      </div>
    </ScrollArea>
  );
}