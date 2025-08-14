'use client';

import React, { useState, useEffect, useRef } from 'react';
import Window from './Window';
import Icon from './Icon';
import { getApps, getApp } from '../lib/apps';
import { useDesktopSettings } from '../lib/store';
import { defaultWindowThemes } from '../lib/themes';
import { FxPlayer } from '../lib/fx';
import { resolveWallpaperUrl, saveWallpaperBlob } from '../lib/wallpapers';

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
  backdropBlurPx?: number;
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
  const { wallpaper, mode, addWallpaper, setWallpaper } = useDesktopSettings();
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

  const openApp = (appId: string, payload?: unknown) => {
    const app = getApp(appId);
    if (!app) return;

    // If a window with same appId and same payload exists, bring it to front
    const stableStringify = (obj: unknown): string => {
      const seen = new WeakSet();
      const stringify = (value: unknown): unknown => {
        if (value && typeof value === 'object') {
          if (seen.has(value)) return undefined;
          seen.add(value);
          if (Array.isArray(value)) return value.map(stringify);
          return Object.keys(value as Record<string, unknown>).sort().reduce((acc: Record<string, unknown>, key) => {
            acc[key] = stringify((value as Record<string, unknown>)[key]);
            return acc;
          }, {});
        }
        return value;
      };
      try { return JSON.stringify(stringify(obj)); } catch { return ''; }
    };

    const payloadKey = stableStringify(payload);
    const existing = windows.find(w => w.appId === appId && stableStringify(w.payload) === payloadKey);
    if (existing) {
      bringToFront(existing.id);
      return existing.id;
    }

    const widthRatio = app.defaultWindow?.widthRatio ?? 0.8;
    const heightRatio = app.defaultWindow?.heightRatio ?? 0.8;

    const defaultOpacity = app.defaultWindow?.opacity;
    const defaultTheme = app.defaultWindow?.theme;

    // Placement helpers
    const rectsIntersect = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => {
      return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
    };
    const existingRects = windows.map(w => ({ x: w.x, y: w.y, w: w.width, h: w.height }));
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
    const findFirstNonOverlapping = (w: number, h: number, preferred?: { x: number; y: number }) => {
      const margin = 8;
      const maxX = Math.max(margin, window.innerWidth - w - margin);
      const maxY = Math.max(margin, window.innerHeight - h - margin);
      const grid = 24;
      // Try preferred first if provided
      if (preferred) {
        const px = clamp(preferred.x, margin, maxX);
        const py = clamp(preferred.y, margin, maxY);
        const candidate = { x: px, y: py, w, h };
        if (!existingRects.some(r => rectsIntersect(candidate, r))) return { x: px, y: py };
      }
      // Scan grid left-to-right, top-to-bottom
      for (let y = margin; y <= maxY; y += grid) {
        for (let x = margin; x <= maxX; x += grid) {
          const candidate = { x, y, w, h };
          if (!existingRects.some(r => rectsIntersect(candidate, r))) return { x, y };
        }
      }
      return null;
    };
    const computeCascade = (w: number, h: number) => {
      const baseX = Math.round(window.innerWidth * 0.1);
      const baseY = Math.round(window.innerHeight * 0.1);
      const step = 28;
      const idx = windows.length;
      let x = baseX + idx * step;
      let y = baseY + idx * step;
      const maxX = window.innerWidth - w - 8;
      const maxY = window.innerHeight - h - 8;
      x = ((x - 8) % Math.max(1, maxX - 8)) + 8;
      y = ((y - 8) % Math.max(1, maxY - 8)) + 8;
      return { x, y };
    };

    // Determine window size
    const persistedAny = loadGeometry(appId);
    const width = persistedAny?.width ?? Math.max(360, window.innerWidth * widthRatio);
    const height = persistedAny?.height ?? Math.max(260, window.innerHeight * heightRatio);

    // Use persisted position only for the first instance of this appId
    const isFirstInstanceForApp = windows.every(w => w.appId !== appId);
    const preferredPos = isFirstInstanceForApp && persistedAny ? { x: persistedAny.x, y: persistedAny.y } : undefined;
    const nonOverlap = findFirstNonOverlapping(width, height, preferredPos);
    const pos = nonOverlap ?? computeCascade(width, height);

    const id = nextId++;
    setWindows(prev => [
      ...prev,
      {
        id,
        appId: appId,
        x: pos.x,
        y: pos.y,
        width,
        height,
        zIndex: Math.max(getHighestZIndex() + 1, 20),
        payload,
        opacity: defaultOpacity,
        backdropBlurPx: app.defaultWindow?.backdropBlurPx,
        theme: defaultTheme,
      },
    ]);
    return id;
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
      // const timersAtCleanup = [...initialOpenTimers.current];
      // timersAtCleanup.forEach(id => clearTimeout(id));
    };
  }, [initialWindows, openApp]);

  const bgStyle: React.CSSProperties = {};
  const [resolvedBg, setResolvedBg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (wallpaper.type === 'image') {
        // Migrate legacy data: URLs to IndexedDB for shorter, efficient blob URLs
        if (typeof wallpaper.value === 'string' && wallpaper.value.startsWith('data:')) {
          try {
            const res = await fetch(wallpaper.value);
            const blob = await res.blob();
            const id = await saveWallpaperBlob(blob);
            const idRef = `idb:${id}`;
            addWallpaper({ type: 'image', value: idRef });
            setWallpaper({ type: 'image', value: idRef });
          } catch {
            // ignore migration failure; fall back to using data URL as-is
          }
        }
        const url = await resolveWallpaperUrl(wallpaper.value);
        if (!cancelled) setResolvedBg(url);
      } else {
        setResolvedBg(null);
      }
    })();
    return () => { cancelled = true; };
  }, [wallpaper, addWallpaper, setWallpaper]);
  if (wallpaper.type === 'image') {
    bgStyle.backgroundImage = resolvedBg ? `url('${resolvedBg}')` : undefined;
  }
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

  const setWindowTitle = React.useCallback((id: number, title: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.titleOverride === title) return w; // avoid unnecessary updates to prevent loops
      return { ...w, titleOverride: title };
    }));
  }, [setWindows]);

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
            backdropBlurPx={win.backdropBlurPx}
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