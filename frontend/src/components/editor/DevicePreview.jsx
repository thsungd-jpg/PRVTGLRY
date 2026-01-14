import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const devices = [
  { id: 'desktop', label: 'Desktop', width: '100%', height: '100%', icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: 375, height: 667, icon: Smartphone }
];

export default function DevicePreview({ children, selectedDevice, onDeviceChange }) {
  const currentDevice = devices.find(d => d.id === selectedDevice) || devices[0];
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Device Selector */}
      <div className="flex items-center justify-center gap-2 p-2 bg-card border-b border-white/10">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <Button
              key={device.id}
              size="sm"
              variant={selectedDevice === device.id ? 'default' : 'ghost'}
              onClick={() => onDeviceChange(device.id)}
              className="gap-1"
              data-testid={`device-${device.id}`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs">{device.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            selectedDevice === 'desktop' ? "w-full h-full" : "device-frame"
          )}
          style={{
            width: selectedDevice === 'desktop' ? '100%' : currentDevice.width,
            height: selectedDevice === 'desktop' ? '100%' : currentDevice.height,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          data-testid="device-preview-container"
        >
          {children}
        </div>
      </div>
    </div>
  );
}