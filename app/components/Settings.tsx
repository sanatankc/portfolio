import React, { useEffect, useState, useRef } from 'react';
import { useDesktopSettings, IconSize } from '../lib/store';
import { defaultWindowThemes } from '../lib/themes';
import { AppProps } from '../lib/apps';
import clsx from 'clsx';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

// Removed built-in wallpapers and URL input. The new UI uses a single
// drag-and-drop/click uploader for setting a custom wallpaper image.


const tabs = [
  {
    label: 'Display',
    value: 'display',
  },
  {
    label: 'System',
    value: 'system',
  },
  {
    label: 'About',
    value: 'about',
  },
  {
    label: 'Reset',
    value: 'reset',
  },
] as const;

const Settings: React.FC<AppProps> = ({ fx }) => {
  const { wallpaper, setWallpaper, wallpapers, addWallpaper, iconSize, setIconSize, mode, setMode, windowOpacity, setWindowOpacity } = useDesktopSettings();
  type TabValue = typeof tabs[number]['value'];
  const [currentTab, setCurrentTab] = useState<TabValue>(tabs[0].value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [defaultWallpapers, setDefaultWallpapers] = useState<string[]>([]);

  // System Info
  const [uptime] = useState(Date.now());
  const sysInfo = {
    os: navigator.platform,
    browser: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    fakeRAM: '16 GB',
    fakeCPU: 'Apple M2',
    uptime: `${Math.floor((Date.now() - uptime)/1000)}s`,
  };

  // Handle wallpaper upload
  const handleFiles = (files: FileList | File[] | null) => {
    const file = files && (files instanceof FileList ? files[0] : files[0]);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    // Soft size guard: 10 MB
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert('Image is too large. Please choose a file under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const value = ev.target?.result as string;
      addWallpaper({ type: 'image', value });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Load default wallpapers from folder via API
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const res = await fetch('/api/wallpapers');
        if (!res.ok) return;
        const data = (await res.json()) as { images: string[] } | string[];
        const list = Array.isArray(data) ? data : data.images;
        setDefaultWallpapers(list ?? []);
      } catch {
        // ignore
      }
    };
    loadDefaults();
  }, []);

  const theme = defaultWindowThemes[mode];


  return (
    <div className="flex h-full w-full">
      <div className="w-40 flex flex-col font-mono text-[13px] py-1 border-r" style={{backgroundColor: theme.background}}>
        
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            className={clsx(
              "text-left w-full justify-start",
              tab.value === currentTab
                ? "font-bold"
                : ""
            )}
            style={{
              clipPath: 'unset',
              border: 'unset'
            }}
            onClick={()=> setCurrentTab(tab.value)}
            onMouseEnter={() => {
              // Only play hover sound if this tab is not currently selected
              if (tab.value !== currentTab) {
                fx.play("hover");
              }
            }}
            onMouseDown={() => {
              if (tab.value !== currentTab) {
                fx.play("click");
              }
            }}
            variant={tab.value === currentTab ? 'primary' : 'secondary'}
            size="sm"
          >{tab.label}</Button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {currentTab==='display' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Display Settings</h2>
            <div className="mb-6">
              <div className="font-semibold mb-2">Wallpaper</div>
              <div
                className={clsx(
                  'relative rounded border-2 transition-colors',
                  'flex flex-col items-center justify-center text-center',
                  'p-6 cursor-pointer select-none',
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300 hover:border-gray-400'
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Drag & drop an image here</div>
                  <div className="text-gray-500">or click to choose a file</div>
                  <div className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 10 MB</div>
                </div>
                {wallpaper.type === 'image' && (
                  <div className="mt-4 flex items-center gap-3">
                    <img src={wallpaper.value} alt="Current wallpaper" className="w-24 h-16 object-cover rounded border" />
                    <div className="text-xs text-gray-600">Current wallpaper</div>
                  </div>
                )}
              </div>
              {/* Saved wallpapers (user uploads) */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Your wallpapers</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {wallpapers
                    .filter(w => w.type === 'image')
                    .map((w, i) => (
                      <button
                        key={`${w.value}-${i}`}
                        className={clsx(
                          'relative group border rounded overflow-hidden h-16',
                          wallpaper.type === 'image' && wallpaper.value === w.value
                            ? 'ring-2 ring-blue-500'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        onClick={() => setWallpaper({ type: 'image', value: w.value })}
                      >
                        <img src={w.value} alt="saved" className="w-full h-full object-cover" />
                        {wallpaper.type === 'image' && wallpaper.value === w.value && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-blue-600 text-white px-1 py-0.5 rounded">Current</span>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Default wallpapers from folder */}
              {defaultWallpapers.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Default wallpapers</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {defaultWallpapers.map((src) => (
                      <button
                        key={src}
                        className={clsx(
                          'relative group border rounded overflow-hidden h-16',
                          wallpaper.type === 'image' && wallpaper.value === src
                            ? 'ring-2 ring-blue-500'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        onClick={() => setWallpaper({ type: 'image', value: src })}
                      >
                        <img src={src} alt="default" className="w-full h-full object-cover" />
                        {wallpaper.type === 'image' && wallpaper.value === src && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-blue-600 text-white px-1 py-0.5 rounded">Current</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Add images to `public/wallpapers/` to extend this list.</div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Icon Size</div>
              <div className="flex gap-2">
                {(['small','regular','large'] as IconSize[]).map(size => (
                  <Button
                    key={size}
                    variant={iconSize===size ? 'primary' : 'secondary'}
                    onClick={()=>setIconSize(size)}
                    disabled={iconSize===size}
                  >{size.charAt(0).toUpperCase()+size.slice(1)}</Button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Dark/Light Mode</div>
              <div className="flex gap-2">
                <Button
                  variant={mode==='dark' ? 'primary' : 'secondary'}
                  onClick={()=>setMode('dark')}
                  disabled={mode==='dark'}
                >Dark</Button>
                <Button
                  variant={mode==='light' ? 'primary' : 'secondary'}
                  onClick={()=>setMode('light')}
                  disabled={mode==='light'}
                >Light</Button>
              </div>
            </div>
          </div>
        )}
        {currentTab==='system' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">System Info</h2>
            <ul className="space-y-1">
              <li><b>OS:</b> {sysInfo.os}</li>
              <li><b>Browser:</b> {sysInfo.browser}</li>
              <li><b>Screen:</b> {sysInfo.screen}</li>
              <li><b>RAM:</b> {sysInfo.fakeRAM}</li>
              <li><b>CPU:</b> {sysInfo.fakeCPU}</li>
              <li><b>Uptime:</b> {sysInfo.uptime}</li>
            </ul>
          </div>
        )}
        {currentTab==='about' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p>This is a retro desktop portfolio built with Next.js, Zustand, and Tailwind CSS.</p>
            <div className="mt-2">
              <a href="https://github.com/your-github" className="underline text-blue-600" target="_blank">GitHub</a> | <a href="https://linkedin.com/in/your-linkedin" className="underline text-blue-600" target="_blank">LinkedIn</a>
            </div>
          </div>
        )}
        {currentTab==='reset' && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-red-500">Reset Desktop</h2>
            <Button variant="danger" onClick={()=>{
              setWallpaper({type:'color', value:'#222'});
              setIconSize('regular');
              setMode('dark');
              setWindowOpacity(0.92);
              // Add more resets here as you add more settings
            }}>Reset Display Settings</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 