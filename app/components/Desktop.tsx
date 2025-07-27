'use client';

import React, { useState, useEffect } from 'react';
import Window from './Window';
import Icon from './Icon';
import { getApps, getApp } from '../lib/apps';
import { useDesktopSettings } from '../lib/store';
import { FxPlayer } from '../lib/fx';

interface WindowState {
  id: number;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface DesktopProps {
  initialWindows?: string[];
  fx?: FxPlayer;
}

let nextId = 1;

const Desktop: React.FC<DesktopProps> = ({ initialWindows = [], fx }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const apps = getApps();

  console.log('apps...', apps)
  const { wallpaper, mode } = useDesktopSettings();

  // Open initial windows after boot
  useEffect(() => {
    if (initialWindows.length > 0) {
      initialWindows.forEach((appId, index) => {
        setTimeout(() => {
          const app = getApp(appId);
          if (app) {
            setWindows(prev => [
              ...prev,
              {
                id: nextId++,
                appId: appId,
                x: window.innerWidth * 0.1 + (index * 30),
                y: window.innerHeight * 0.1 + (index * 30),
                width: window.innerWidth * 0.6,
                height: window.innerHeight * 0.6,
                zIndex: 20 + index,
              },
            ]);
          }
        }, index * 200); // Stagger window opening
      });
    }
  }, [initialWindows]);

  const bgStyle: React.CSSProperties = {};
  if (wallpaper.type === 'color') {
    bgStyle.background = wallpaper.value;
  } else if (wallpaper.type === 'image') {
    bgStyle.backgroundImage = `url('${wallpaper.value}')`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  }
  if (mode === 'dark') {
    bgStyle.backgroundColor = '#18181b';
    bgStyle.color = '#fff';
  } else {
    bgStyle.backgroundColor = '#f3f4f6';
    bgStyle.color = '#222';
  }

  const openApp = (appId: string) => {
    const app = getApp(appId);
    if (!app) return;

    setWindows([
      ...windows,
      {
        id: nextId++,
        appId: appId,
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.1,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
        zIndex: Math.max(getHighestZIndex() + 1, 20),
      },
    ]);
  };

  const closeWindow = (id: number) => {
    fx?.play("close");
    setWindows(windows.filter(w => w.id !== id));
  };

  const bringToFront = (id: number) => {
    const highestZIndex = getHighestZIndex();
    setWindows(
      windows.map(w =>
        w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w
      )
    );
  };

  const updateWindowPosition = (id: number, x: number, y: number) => {
    setWindows(windows.map(w => (w.id === id ? { ...w, x, y } : w)));
  };

  const updateWindowSize = (id: number, width: number, height: number, x: number, y: number) => {
    setWindows(windows.map(w => (w.id === id ? { ...w, width, height, x, y } : w)));
  };

  const getHighestZIndex = () => {
    return windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
  };

  return (
    <div className="w-screen h-screen relative" style={bgStyle}>
      <div className="absolute left-0 top-0 h-full flex flex-col gap-8 p-4 z-0">
        {apps.map(app => (
          <Icon key={app.id} label={app.name} onDoubleClick={() => openApp(app.id)}>
            <app.icon />
          </Icon>
        ))}
      </div>

      {windows.map(win => {
        const app = getApp(win.appId);
        if (!app || !fx) return null;
        const AppComponent = app.component;
        return (
          <Window
            key={win.id}
            title={app.name}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            zIndex={win.zIndex}
            onClose={() => closeWindow(win.id)}
            onFocus={() => bringToFront(win.id)}
            onDragStop={(x, y) => updateWindowPosition(win.id, x, y)}
            onResizeStop={(width, height, x, y) => updateWindowSize(win.id, width, height, x, y)}
          >
            <AppComponent fx={fx} />
          </Window>
        );
      })}
    </div>
  );
};

export default Desktop; 