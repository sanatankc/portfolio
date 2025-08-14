'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFilesystem, Directory } from '@/app/lib/filesystem';
import { getDirectoryByPath, resolvePath } from '@/app/lib/path';
import { AppProps } from '@/app/lib/apps';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

type FileRow = { name: string; type: 'Folder' | 'Text'; size: string; modified: string };

type PickerMode =
  | { kind: 'none' }
  | { kind: 'open'; onPickId?: string; filterExt?: string[] }
  | { kind: 'save'; onPickId?: string; suggestedName?: string; filterExt?: string[] };

interface FileBrowserPayload { path?: string[]; picker?: PickerMode }
function isFileBrowserPayload(value: unknown): value is FileBrowserPayload {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!('path' in obj)) return true;
  const p = (obj as { path?: unknown }).path;
  return p === undefined || (Array.isArray(p) && p.every(seg => typeof seg === 'string'));
}

const FileBrowser: React.FC<AppProps> = ({ fx, openApp, payload, closeSelf }) => {
  void fx;
  const initialPath = isFileBrowserPayload(payload) && payload?.path ? payload.path : ['~'];
  const picker: PickerMode = (isFileBrowserPayload(payload) && (payload as any).picker)
    ? (payload as any).picker as PickerMode
    : ({ kind: 'none' } as const);
  const { fs, mkdir } = useFilesystem();
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [history, setHistory] = useState<string[][]>([initialPath]);
  const [histIndex, setHistIndex] = useState<number>(0);
  const [pathInput, setPathInput] = useState<string>(initialPath.join('/'));
  const [fileNameInput, setFileNameInput] = useState<string>(picker.kind === 'save' && 'suggestedName' in picker && picker.suggestedName ? picker.suggestedName : '');

  const dir = useMemo(() => getDirectoryByPath(currentPath, fs) as Directory, [currentPath, fs]);

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
    const { newPath, error } = resolvePath(target, currentPath, fs);
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
        const fullPath = currentPath.concat(row.name);
        if (picker.kind === 'open') {
          // In open picker: filter by ext if provided, then return path
          if (!picker.filterExt || picker.filterExt.some((ext: string) => row.name.toLowerCase().endsWith(ext))) {
            // Use a global callback registry via localStorage event channel
            if (picker.onPickId) {
              localStorage.setItem(`picker:${picker.onPickId}`, JSON.stringify(fullPath));
            }
            closeSelf?.();
            return;
          }
          return;
        }
        // Normal open behavior
        if (/\.(md|notes)$/i.test(row.name)) openApp('notes', { path: fullPath });
      }
    }
  };

  const confirmSave = () => {
    if (picker.kind !== 'save') return;
    if (!fileNameInput.trim()) return;
    const finalName = fileNameInput.trim();
    const fullPath = [...currentPath, finalName];
    if (picker.onPickId) {
      localStorage.setItem(`picker:${picker.onPickId}`, JSON.stringify(fullPath));
    }
    closeSelf?.();
  };

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(rows.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      openRow(rows[selectedIndex]);
    } else if (e.key === 'Backspace') {
      navigate('..');
    }
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [headerWidth, setHeaderWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setHeaderWidth(el.scrollWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [rows.length, currentPath.join('/')]);

  return (
    <div className="w-full h-full flex flex-col font-mono text-slate-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-300 bg-white">
        <Button size="sm" onClick={goBack} disabled={histIndex <= 0}>←</Button>
        <Button size="sm" onClick={goForward} disabled={histIndex >= history.length - 1}>→</Button>
        <Button size="sm" onClick={() => navigate('..')} disabled={currentPath.length <= 1}>↑</Button>
        <Input
          className="flex-1 text-xs"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate(pathInput); }}
        />
        {picker.kind !== 'none' && (
          <Button size="sm" variant="secondary" onClick={() => closeSelf?.()}>Cancel</Button>
        )}
      </div>

      {/* Scroll area with sticky header */}
      <div ref={scrollRef} className="flex-1 overflow-auto outline-none bg-white [scrollbar-gutter:stable]" tabIndex={0} onKeyDown={onKey}>
        <div className="sticky top-0 z-10 grid min-w-full grid-cols-[minmax(200px,1fr)_160px_120px_160px] px-3 py-2 text-xs bg-slate-50 border-b border-slate-200" style={{ width: headerWidth ? `${headerWidth}px` : undefined }}>
          <div className="font-semibold">Name</div>
          <div className="font-semibold">Type</div>
          <div className="font-semibold">Size</div>
          <div className="font-semibold">Modified</div>
        </div>
        {rows.map((row, idx) => (
          <button
            key={row.name}
            className={`group w-full min-w-full block text-left border-b border-slate-100`}
            onDoubleClick={() => openRow(row)}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <div
              className={`grid grid-cols-[minmax(200px,1fr)_160px_120px_160px] px-3 py-2 text-xs ${idx === selectedIndex ? 'bg-slate-100' : 'bg-white'} group-hover:bg-slate-100`}
              style={{ width: headerWidth ? `${headerWidth}px` : undefined }}
            >
              <div className="flex items-center gap-2">
                <span>
                  {row.type === 'Folder'
                    ? '📁'
                    : (/\.(md|notes)$/i.test(row.name) ? '📝' : '📄')}
                </span>
                <span>{row.name}</span>
              </div>
              <div>{row.type}</div>
              <div>{row.size}</div>
              <div>{row.modified}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Picker footer */}
      {picker.kind === 'save' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-t border-slate-200">
          <span className="text-xs">Save As:</span>
          <Input className="flex-1 text-xs" value={fileNameInput} onChange={(e) => setFileNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmSave(); }} />
          <Button size="sm" variant="primary" onClick={confirmSave}>Save</Button>
        </div>
      )}

      {/* Status bar */}
      <div className="px-3 py-1 text-[11px] bg-slate-50 border-t border-slate-200 text-slate-600">{rows.length} items</div>
    </div>
  );
};

export default FileBrowser;


