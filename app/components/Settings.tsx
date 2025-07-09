import React, { useState, useRef } from 'react';
import { useDesktopSettings, WallpaperType, IconSize } from '../lib/store';
import { defaultWindowThemes } from '../lib/themes';
import { AppProps } from '../lib/apps';
import clsx from 'clsx';

const builtInWallpapers: WallpaperType[] = [
  { type: 'color', value: '#222' },
  { type: 'color', value: '#1e293b' },
  { type: 'color', value: '#fbbf24' },
  { type: 'color', value: '#f472b6' },
  { type: 'image', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { type: 'image', value: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
];


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
  const { wallpaper, setWallpaper, iconSize, setIconSize, mode, setMode } = useDesktopSettings();
  const [customUrl, setCustomUrl] = useState('');
  type TabValue = typeof tabs[number]['value'];
  const [currentTab, setCurrentTab] = useState<TabValue>(tabs[0].value);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setWallpaper({ type: 'image', value: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const theme = defaultWindowThemes[mode];


  return (
    <div className="flex h-full w-full">
      <div className="w-40 flex flex-col font-mono text-[13px] py-1 border-r" style={{backgroundColor: theme.background}}>
        
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={clsx(
              "text-left w-full px-3 py-2 justify-start",
              tab.value === currentTab
                ? "font-bold text-white bg-black"
                : "text-black hover:text-black/60"
            )}
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
          >{tab.label}</button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {currentTab==='display' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Display Settings</h2>
            <div className="mb-4">
              <div className="font-semibold mb-1">Wallpaper</div>
              <div className="flex gap-2 flex-wrap mb-2">
                {builtInWallpapers.map((wp, i) => (
                  <button key={i} className="w-16 h-16 border-2 border-gray-300" onClick={()=>setWallpaper(wp)}>
                    {wp.type==='color' ? (
                      <div className="w-full h-full" style={{background: wp.value}} />
                    ) : (
                      <img src={wp.value} alt="wallpaper" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
                <button className="w-16 h-16 border-2 border-gray-300 flex items-center justify-center" onClick={()=>fileInputRef.current?.click()}>
                  <span className="text-xs">Upload</span>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </button>
              </div>
              <div className="mb-2">Or enter image URL:</div>
              <div className="flex gap-2 mb-2">
                <input value={customUrl} onChange={e=>setCustomUrl(e.target.value)} className="border px-2 py-1 flex-1" placeholder="https://..." />
                <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={()=>{
                  setWallpaper({type:'image', value: customUrl});
                  setCustomUrl('');
                }}>Set</button>
              </div>
              <div className="mt-2">Current: {wallpaper.type==='color' ? <span className="px-2 py-1 rounded" style={{background: wallpaper.value, color: '#fff'}}>{wallpaper.value}</span> : <span>{wallpaper.value}</span>}</div>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Icon Size</div>
              <div className="flex gap-2">
                {(['small','regular','large'] as IconSize[]).map(size => (
                  <button
                    key={size}
                    className={`px-3 py-1 rounded border transition-colors
                      ${iconSize===size ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-200 dark:hover:bg-blue-900'}
                      disabled:opacity-50 disabled:cursor-not-allowed`
                    }
                    onClick={()=>setIconSize(size)}
                    disabled={iconSize===size}
                  >{size.charAt(0).toUpperCase()+size.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Dark/Light Mode</div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded border transition-colors
                    ${mode==='dark' ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-200 dark:hover:bg-blue-900'}
                    disabled:opacity-50 disabled:cursor-not-allowed`
                  }
                  onClick={()=>setMode('dark')}
                  disabled={mode==='dark'}
                >Dark</button>
                <button
                  className={`px-3 py-1 rounded border transition-colors
                    ${mode==='light' ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-200 dark:hover:bg-blue-900'}
                    disabled:opacity-50 disabled:cursor-not-allowed`
                  }
                  onClick={()=>setMode('light')}
                  disabled={mode==='light'}
                >Light</button>
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
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={()=>{
              setWallpaper({type:'color', value:'#222'});
              setIconSize('regular');
              setMode('dark');
              // Add more resets here as you add more settings
            }}>Reset Display Settings</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 