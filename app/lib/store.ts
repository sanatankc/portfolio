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

// Temporary hack: ideally I want this to directly get from wallpapers folder
const defaultWallpapers: WallpaperType[] = [
  // Use bundled wallpapers from the public/wallpapers folder; first one is default
  { type: 'image', value: '/wallpapers/9285000.jpg' },
  { type: 'image', value: '/wallpapers/1138740.png' },
  { type: 'image', value: '/wallpapers/1293302.jpg' },
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
  mode: 'light',
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