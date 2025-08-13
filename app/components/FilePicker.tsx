'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFilesystem, Directory } from '@/app/lib/filesystem';
import { getDirectoryByPath, resolvePath } from '@/app/lib/path';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

type FileRow = { name: string; type: 'Folder' | 'Text'; size: string; modified: string };

interface FilePickerProps {
  initialPath?: string[];
  mode: 'open' | 'save';
  filterExt?: string[]; // like ['.md', '.notes']
  suggestedName?: string;
  onConfirm: (path: string[]) => void;
  onCancel: () => void;
}

const FilePicker: React.FC<FilePickerProps> = ({ initialPath = ['~'], mode, filterExt, suggestedName, onConfirm, onCancel }) => {
  const { fs } = useFilesystem();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [centerVertically, setCenterVertically] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [history, setHistory] = useState<string[][]>([initialPath]);
  const [histIndex, setHistIndex] = useState<number>(0);
  const [pathInput, setPathInput] = useState<string>(initialPath.join('/'));
  const [fileName, setFileName] = useState<string>(suggestedName ?? '');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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
      if (mode === 'open') {
        if (!filterExt || filterExt.some(ext => row.name.toLowerCase().endsWith(ext))) {
          onConfirm(currentPath.concat(row.name));
        }
      } else if (mode === 'save') {
        setFileName(row.name);
      }
    }
  };

  const confirm = () => {
    if (mode === 'open') return; // Not used here; double-click selects
    if (!fileName.trim()) return;
    onConfirm([...currentPath, fileName.trim()]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // Decide whether to center or pin to top based on available height
  useEffect(() => {
    const measure = () => {
      const overlay = overlayRef.current;
      const modal = modalRef.current;
      if (!overlay || !modal) return;
      const overlayH = overlay.clientHeight;
      const modalH = modal.clientHeight;
      setCenterVertically(modalH + 32 < overlayH); // keep 16px margins
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (overlayRef.current) ro.observe(overlayRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={overlayRef} className={`absolute inset-0 bg-black/40 z-50 flex justify-center ${centerVertically ? 'items-center' : 'items-start pt-4'}`}>
      <div ref={modalRef} className="bg-white text-slate-900 w-[640px] max-w-[92%] min-w-[360px] max-h-[85%] border border-slate-300 shadow-lg flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-slate-50">
          <Button size="sm" onClick={goBack} disabled={histIndex <= 0}>←</Button>
          <Button size="sm" onClick={goForward} disabled={histIndex >= history.length - 1}>→</Button>
          <Button size="sm" onClick={() => navigate('..')}>↑</Button>
          <Input
            className="flex-1 text-xs"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(pathInput); }}
          />
        </div>

        {/* Header */}
        <div className="grid grid-cols-[minmax(320px,1fr)_120px_120px] px-3 py-2 text-xs bg-slate-50 border-b border-slate-200">
          <div className="font-semibold">Name</div>
          <div className="font-semibold">Type</div>
          <div className="font-semibold">Size</div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-auto outline-none" tabIndex={0}>
          {rows.map((row, idx) => (
            <button
              key={row.name}
              className={`w-full grid grid-cols-[minmax(320px,1fr)_120px_120px] px-3 py-2 text-xs text-left border-b border-slate-100 hover:bg-slate-100 ${idx === selectedIndex ? 'bg-slate-100' : ''}`}
              onDoubleClick={() => openRow(row)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="flex items-center gap-2">
                <span>{row.type === 'Folder' ? '📁' : '📄'}</span>
                <span>{row.name}</span>
              </div>
              <div>{row.type}</div>
              <div>{row.size}</div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-2 border-t border-slate-200 bg-slate-50">
          {mode === 'save' && (
            <>
              <span className="text-xs">Save As:</span>
              <Input className="flex-1 text-xs" value={fileName} onChange={(e) => setFileName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirm(); }} />
            </>
          )}
          <div className="flex-1" />
          <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
          {mode === 'save' ? (
            <Button size="sm" variant="primary" onClick={confirm}>Save</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FilePicker;


