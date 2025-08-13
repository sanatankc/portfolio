'use client';

import React, { useState, useEffect, useRef } from 'react';
import Window from './Window';
import Icon from './Icon';
import { getApps, getApp } from '../lib/apps';
import { useDesktopSettings } from '../lib/store';
import { defaultWindowThemes } from '../lib/themes';
import { FxPlayer } from '../lib/fx';

interface WindowState {
  id: number;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  payload?: unknown;
  opacity?: number;
  theme?: typeof defaultWindowThemes.dark;
  titleOverride?: string;
}

type InitialWindow = string | { appId: string; payload?: unknown };

interface DesktopProps {
  initialWindows?: InitialWindow[];
  fx?: FxPlayer;
}

let nextId = 1;

const Desktop: React.FC<DesktopProps> = ({ initialWindows = [], fx }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const apps = getApps();

  console.log('apps...', apps)
  const { wallpaper, mode } = useDesktopSettings();
  const silentFx: FxPlayer = { play: () => {}, isLoaded: () => false };
  const effectiveFx = fx ?? silentFx;

  // --- Geometry persistence helpers ---
  const loadGeometry = (appId: string) => {
    try {
      const raw = localStorage.getItem(`wingeom:${appId}`);
      if (!raw) return null as null | { width: number; height: number; x: number; y: number };
      return JSON.parse(raw) as { width: number; height: number; x: number; y: number };
    } catch {
      return null;
    }
  };

  const saveGeometry = (appId: string, geom: { width: number; height: number; x: number; y: number }) => {
    try {
      localStorage.setItem(`wingeom:${appId}`, JSON.stringify(geom));
    } catch {
      // ignore
    }
  };

  // Open initial windows after boot using the standard openApp flow
  const initialOpenTimers = useRef<number[]>([]);
  const hasOpenedInitialWindows = useRef(false);
  useEffect(() => {
    console.log('initialWindows...', initialWindows, hasOpenedInitialWindows.current)
    if (hasOpenedInitialWindows.current || initialWindows.length === 0) return;
    hasOpenedInitialWindows.current = true;
    initialWindows.forEach((entry, index) => {
      const appId = typeof entry === 'string' ? entry : entry.appId;
      const payload = typeof entry === 'string' ? undefined : entry.payload;
      console.log('hello...', 'app open???', 'appId', appId)
      const timer = window.setTimeout(() => {
        console.log('hello...', 'app open???', 'appId', appId)
        openApp(appId, payload)
      }, index * 100);
      initialOpenTimers.current.push(timer);
    });
    return () => {
      console.log('initialOpenTimers... canceling', initialOpenTimers.current)
      // initialOpenTimers.current.forEach(id => clearTimeout(id));
      // initialOpenTimers.current = [];
    };
  }, [initialWindows]);

  const bgStyle: React.CSSProperties = {};
  bgStyle.backgroundImage = `url('${wallpaper.value}')`;
  bgStyle.backgroundSize = 'cover';
  bgStyle.backgroundPosition = 'center';
  if (wallpaper.type === 'color') {
    bgStyle.background = wallpaper.value;
  } else if (wallpaper.type === 'image') {
  }
  if (mode === 'dark') {
    bgStyle.backgroundColor = '#18181b';
    bgStyle.color = '#fff';
  } else {
    bgStyle.backgroundColor = '#f3f4f6';
    bgStyle.color = '#222';
  }

  const openApp = (appId: string, payload?: unknown) => {
    const app = getApp(appId);
    if (!app) return;

    const widthRatio = app.defaultWindow?.widthRatio ?? 0.8;
    const heightRatio = app.defaultWindow?.heightRatio ?? 0.8;

    console.log('app.defailWindow...', app.defaultWindow)
    const defaultOpacity = app.defaultWindow && 'opacity' in app.defaultWindow 
      ? (app.defaultWindow as any).opacity as number | undefined 
      : undefined;
    const defaultTheme = app.defaultWindow?.theme;
    const persisted = loadGeometry(appId);

    const id = nextId++;
    setWindows(prev => [
      ...prev,
      {
        id,
        appId: appId,
        x: persisted?.x ?? window.innerWidth * 0.1,
        y: persisted?.y ?? window.innerHeight * 0.1,
        width: persisted?.width ?? Math.max(360, window.innerWidth * widthRatio),
        height: persisted?.height ?? Math.max(260, window.innerHeight * heightRatio),
        zIndex: Math.max(getHighestZIndex() + 1, 20),
        payload,
        opacity: defaultOpacity,
        theme: defaultTheme,
      },
    ]);
    return id;
  };
  const setWindowTitle = (id: number, title: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.titleOverride === title) return w; // avoid unnecessary updates to prevent loops
      return { ...w, titleOverride: title };
    }));
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
    // Snap to 8px grid
    const snap = (n: number) => Math.round(n / 8) * 8;
    const snappedX = snap(x);
    const snappedY = snap(y);
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const updated = { ...w, x: snappedX, y: snappedY };
      saveGeometry(w.appId, { width: updated.width, height: updated.height, x: updated.x, y: updated.y });
      return updated;
    }));
  };

  const updateWindowSize = (id: number, width: number, height: number, x: number, y: number) => {
    const snap = (n: number) => Math.round(n / 8) * 8;
    const snapped = { width: snap(width), height: snap(height), x: snap(x), y: snap(y) };
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const updated = { ...w, ...snapped };
      saveGeometry(w.appId, { width: updated.width, height: updated.height, x: updated.x, y: updated.y });
      return updated;
    }));
  };

  const getHighestZIndex = () => {
    return windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
  };


  console.log('wins', windows)
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
        if (!app) return null;
        const AppComponent = app.component;
        return (
          <Window
            key={win.id}
            title={win.titleOverride ?? app.name}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            zIndex={win.zIndex}
            onClose={() => closeWindow(win.id)}
            onFocus={() => bringToFront(win.id)}
            onDragStop={(x, y) => updateWindowPosition(win.id, x, y)}
            onResizeStop={(width, height, x, y) => updateWindowSize(win.id, width, height, x, y)}
            opacity={win.opacity}
            theme={win.theme}
          >
            <AppComponent
              fx={effectiveFx}
              openApp={openApp}
              setWindowTitle={(t) => setWindowTitle(win.id, t)}
              closeSelf={() => closeWindow(win.id)}
              payload={win.payload}
            />
          </Window>
        );
      })}
    </div>
  );
};

export default Desktop; 