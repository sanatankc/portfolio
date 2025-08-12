'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppProps } from '@/app/lib/apps';

interface BrowserPayload { url?: string }

function isBrowserPayload(value: unknown): value is BrowserPayload {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!('url' in obj)) return true; // optional
  return typeof obj.url === 'string' || typeof obj.url === 'undefined';
}

const Browser: React.FC<AppProps> = ({ fx, payload }) => {
  void fx;
  const initialUrl = isBrowserPayload(payload) && payload?.url ? payload.url : '/blog/glitch-house';
  const [url, setUrl] = useState<string>(initialUrl);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isBrowserPayload(payload) && payload?.url) setUrl(payload.url);
  }, [payload]);

  const go = (next: string) => {
    setUrl(next);
  };

  const openNewTab = () => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex items-center gap-2 p-2 border-b border-slate-200">
        <input
          ref={inputRef}
          className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') go(url);
          }}
          placeholder="Enter URL (e.g., /blog/glitch-house)"
        />
        <button className="px-2 py-1 text-sm border border-slate-300 rounded" onClick={() => go(url)}>Go</button>
        <button className="px-2 py-1 text-sm border border-slate-300 rounded" onClick={openNewTab}>Open in new tab</button>
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe title="browser" src={url} className="w-full h-full" />
      </div>
    </div>
  );
};

export default Browser;


