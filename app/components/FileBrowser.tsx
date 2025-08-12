'use client';

import React, { useMemo, useState } from 'react';
import { filesystem, Directory } from '@/app/lib/filesystem';
import { getDirectoryByPath, resolvePath } from '@/app/lib/path';
import { AppProps } from '@/app/lib/apps';

type FileRow = { name: string; type: 'Folder' | 'Text'; size: string; modified: string };

interface FileBrowserPayload { path?: string[] }
function isFileBrowserPayload(value: unknown): value is FileBrowserPayload {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!('path' in obj)) return true;
  const p = (obj as { path?: unknown }).path;
  return p === undefined || (Array.isArray(p) && p.every(seg => typeof seg === 'string'));
}

const FileBrowser: React.FC<AppProps> = ({ fx, openApp, payload }) => {
  void fx;
  const initialPath = isFileBrowserPayload(payload) && payload?.path ? payload.path : ['~'];
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [history, setHistory] = useState<string[][]>([initialPath]);
  const [histIndex, setHistIndex] = useState<number>(0);
  const [pathInput, setPathInput] = useState<string>(initialPath.join('/'));

  const dir = useMemo(() => getDirectoryByPath(currentPath, filesystem) as Directory, [currentPath]);

  const rows: FileRow[] = useMemo(() => {
    return Object.keys(dir)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const value = dir[name];
        const isText = typeof value === 'string';
        return {
          name,
          type: isText ? 'Text' : 'Folder',
          size: isText ? `${(value as string).length} B` : '--',
          modified: '--',
        } as FileRow;
      });
  }, [dir]);

  const pushHistory = (next: string[]) => {
    const newHist = [...history.slice(0, histIndex + 1), next];
    setHistory(newHist);
    setHistIndex(newHist.length - 1);
  };

  const navigate = (target: string) => {
    const { newPath, error } = resolvePath(target, currentPath, filesystem);
    if (error || !newPath) return;
    setCurrentPath(newPath);
    setPathInput(newPath.join('/'));
    pushHistory(newPath);
  };

  const goBack = () => {
    if (histIndex <= 0) return;
    const nextIndex = histIndex - 1;
    setHistIndex(nextIndex);
    setCurrentPath(history[nextIndex]);
    setPathInput(history[nextIndex].join('/'));
  };

  const goForward = () => {
    if (histIndex >= history.length - 1) return;
    const nextIndex = histIndex + 1;
    setHistIndex(nextIndex);
    setCurrentPath(history[nextIndex]);
    setPathInput(history[nextIndex].join('/'));
  };

  const openRow = (row: FileRow) => {
    if (row.type === 'Folder') {
      navigate(row.name);
    } else {
      const value = dir[row.name];
      if (typeof value === 'string') {
        openApp('notes', { notes: [{ id: currentPath.concat(row.name).join('/'), title: row.name, content: value }] });
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-slate-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-300 bg-white">
        <button className="px-2 py-1 border border-slate-300 text-xs rounded disabled:opacity-40" onClick={goBack} disabled={histIndex <= 0}>←</button>
        <button className="px-2 py-1 border border-slate-300 text-xs rounded disabled:opacity-40" onClick={goForward} disabled={histIndex >= history.length - 1}>→</button>
        <button className="px-2 py-1 border border-slate-300 text-xs rounded" onClick={() => navigate('..')}>↑</button>
        <input
          className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate(pathInput); }}
        />
      </div>

      {/* Header */}
      <div className="grid grid-cols-[minmax(200px,1fr)_160px_120px_160px] px-3 py-2 text-xs bg-slate-50 border-b border-slate-200">
        <div className="font-semibold">Name</div>
        <div className="font-semibold">Type</div>
        <div className="font-semibold">Size</div>
        <div className="font-semibold">Modified</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {rows.map((row) => (
          <button
            key={row.name}
            className="w-full grid grid-cols-[minmax(200px,1fr)_160px_120px_160px] px-3 py-2 text-xs text-left hover:bg-slate-100 border-b border-slate-100"
            onDoubleClick={() => openRow(row)}
          >
            <div className="flex items-center gap-2">
              <span>{row.type === 'Folder' ? '📁' : '📄'}</span>
              <span>{row.name}</span>
            </div>
            <div>{row.type}</div>
            <div>{row.size}</div>
            <div>{row.modified}</div>
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 text-[11px] bg-slate-50 border-t border-slate-200 text-slate-600">{rows.length} items</div>
    </div>
  );
};

export default FileBrowser;


