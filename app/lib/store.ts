import { create } from 'zustand';

export type WallpaperType = { type: 'color'; value: string } | { type: 'image'; value: string };

export type IconSize = 'small' | 'regular' | 'large';

export type Mode = 'dark' | 'light';

interface DesktopSettingsState {
  wallpaper: WallpaperType;
  setWallpaper: (wallpaper: WallpaperType) => void;
  wallpapers: WallpaperType[];
  addWallpaper: (wallpaper: WallpaperType) => void;
  iconSize: IconSize;
  setIconSize: (size: IconSize) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  // Opacity applied to window backgrounds (1 = opaque). Range [0.6, 1]
  windowOpacity: number;
  setWindowOpacity: (opacity: number) => void;
  hydrate: () => void;
  persist: () => void;
}

const defaultWallpapers: WallpaperType[] = [
  { type: 'color', value: '#222' },
  { type: 'color', value: '#1e293b' },
  { type: 'color', value: '#fbbf24' },
  { type: 'color', value: '#f472b6' },
  { type: 'image', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { type: 'image', value: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
];

const LS_KEY = 'desktop_settings_v1';

export const useDesktopSettings = create<DesktopSettingsState>((set, get) => ({
  wallpaper: defaultWallpapers[0],
  setWallpaper: (wallpaper) => {
    set({ wallpaper });
    get().persist();
  },
  wallpapers: defaultWallpapers,
  addWallpaper: (wallpaper) => {
    const exists = get().wallpapers.some(w => w.value === wallpaper.value);
    if (!exists) {
      set({ wallpapers: [...get().wallpapers, wallpaper] });
      get().persist();
    }
    set({ wallpaper });
    get().persist();
  },
  iconSize: 'regular',
  setIconSize: (iconSize) => { set({ iconSize }); get().persist(); },
  mode: 'dark',
  setMode: (mode) => { set({ mode }); get().persist(); },
  windowOpacity: 1,
  setWindowOpacity: (windowOpacity) => { set({ windowOpacity }); get().persist(); },
  hydrate: () => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Merge with defaults to ensure new fields are populated
      set({ ...get(), ...data });
    }
  },
  persist: () => {
    const {wallpaper, wallpapers, iconSize, mode, windowOpacity} = get();
    localStorage.setItem(LS_KEY, JSON.stringify({wallpaper, wallpapers, iconSize, mode, windowOpacity}));
  }
}));

// Hydrate on load
if (typeof window !== 'undefined') {
  useDesktopSettings.getState().hydrate();
} 