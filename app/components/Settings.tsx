import React, { useState, useRef } from 'react';
import { useDesktopSettings, WallpaperType, IconSize } from '../lib/store';

const builtInWallpapers: WallpaperType[] = [
  { type: 'color', value: '#222' },
  { type: 'color', value: '#1e293b' },
  { type: 'color', value: '#fbbf24' },
  { type: 'color', value: '#f472b6' },
  { type: 'image', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { type: 'image', value: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80' },
];

const Settings: React.FC = () => {
  const { wallpaper, setWallpaper, iconSize, setIconSize, mode, setMode } = useDesktopSettings();
  const [customUrl, setCustomUrl] = useState('');
  const [tab, setTab] = useState<'display'|'system'|'about'|'reset'>('display');
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

  return (
    <div className="flex h-full w-full">
      <div className="w-40 flex flex-col gap-2 border-r p-4 bg-gray-100 dark:bg-gray-900">
        <button
          className={`text-left w-full px-3 py-2 rounded justify-start ${tab==='display' ? 'font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          onClick={()=>setTab('display')}
        >Display</button>
        <button
          className={`text-left w-full px-3 py-2 rounded justify-start ${tab==='system' ? 'font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          onClick={()=>setTab('system')}
        >System Info</button>
        <button
          className={`text-left w-full px-3 py-2 rounded justify-start ${tab==='about' ? 'font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          onClick={()=>setTab('about')}
        >About</button>
        <button
          className={`text-left w-full px-3 py-2 rounded justify-start ${tab==='reset' ? 'font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900' : 'text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
          onClick={()=>setTab('reset')}
        >Reset</button>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {tab==='display' && (
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
        {tab==='system' && (
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
        {tab==='about' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p>This is a retro desktop portfolio built with Next.js, Zustand, and Tailwind CSS.</p>
            <div className="mt-2">
              <a href="https://github.com/your-github" className="underline text-blue-600" target="_blank">GitHub</a> | <a href="https://linkedin.com/in/your-linkedin" className="underline text-blue-600" target="_blank">LinkedIn</a>
            </div>
          </div>
        )}
        {tab==='reset' && (
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