'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppProps } from '@/app/lib/apps';
import { useFilesystem } from '@/app/lib/filesystem';
import Button from '@/app/components/ui/Button';
import FilePicker from '@/app/components/FilePicker';
import dynamic from 'next/dynamic'
import { Suspense } from 'react';


const NotesMdxEditor = dynamic(() => import('@/app/components/NotesMdxEditor'), { ssr: false })

interface NotesPayload { path?: string[] }
function isNotesPayload(value: unknown): value is NotesPayload {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!('path' in obj)) return true;
  const p = (obj as { path?: unknown }).path;
  return p === undefined || (Array.isArray(p) && p.every(seg => typeof seg === 'string'));
}

function stripExtension(name: string) {
  return name.replace(/\.(md|notes)$/i, '');
}

const Notes: React.FC<AppProps> = ({ fx, payload, openApp, setWindowTitle }) => {
  void fx;
  const { writeFile, mkdir, isBundledFile } = useFilesystem();
  const fsSnapshot = useFilesystem(state => state.fs);

  console.log("NOtes app with payload", payload)

  // Determine initial path (if opened from File Browser) else start as new Untitled note
  const initialPath = useMemo(() => (isNotesPayload(payload) && payload?.path) ? payload.path! : null, [payload]);

  const [path, setPath] = useState<string[] | null>(initialPath);
  const [draftContent, setDraftContent] = useState<string>('');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  
  // Derive content directly from FS for existing files; keep local state for unsaved drafts
  const existingFileContent = useFilesystem(React.useCallback((state) => {
    if (!path) return '';
    let current: any = state.fs as any;
    for (let i = 0; i < path.length - 1; i++) {
      if (typeof current !== 'object') return '';
      current = current[path[i]];
      if (current === undefined) return '';
    }
    if (typeof current !== 'object') return '';
    const last = path[path.length - 1];
    const value = current[last];
    return typeof value === 'string' ? value : '';
  }, [path]));

  // Reset draft content when creating a new note
  useEffect(() => {
    if (!initialPath) setDraftContent('');
  }, [initialPath]);

  const filename = useMemo(() => {
    if (path && path.length > 0) return path[path.length - 1];
    return 'Untitled.notes';
  }, [path]);

  // Update title from file name (without extension) or first markdown H1 if present
  useEffect(() => {
    const base = stripExtension(filename);
    setWindowTitle?.(base || 'Untitled');
  }, [filename, existingFileContent, draftContent]);

  const save = () => {
    if (!path) {
      setShowPicker(true);
      return;
    }
  };


  return (
    <div className="w-full h-full flex flex-col font-mono relative z-0">
      {/* MDX live editor */}
      <div className="flex-1 min-h-0 p-2 overflow-auto [scrollbar-gutter:stable]">
        <Suspense fallback={<div>Loading Editor ...</div>}>
          <NotesMdxEditor
            key={(path ?? ['new']).join('/')}
            value={path ? existingFileContent : draftContent}
            onChange={(next) => {
              if (path) {
                if (!isBundledFile(path)) writeFile(path, next);
              } else {
                setDraftContent(next);
              }
            }}
            readOnly={path ? isBundledFile(path) : false}
            onOpenInternalLink={(href) => {
              let segments: string[] = [];
              try {
                if (/^https?:\/\//i.test(href)) {
                  const u = new URL(href);
                  if (u.hostname === 'notes.app' || u.hostname.endsWith('.notes.app')) {
                    let p = u.pathname || '/';
                    if (p.startsWith('/notes.app/')) p = p.slice('/notes.app/'.length);
                    if (p.startsWith('/')) p = p.slice(1);
                    segments = p.split('/').filter(Boolean);
                  }
                  if (u.hostname === 'browser.app' || u.hostname.endsWith('.browser.app')) {
                    openApp?.('browser', { url: u.pathname.replace(/^\/?browser\.app\/?/, '/') || '/' });
                    return;
                  }
                }
              } catch { /* ignore URL parse errors */ }
              if (segments.length === 0) {
                const normalized = href
                  .replace(/^notes:\/\//i, '')
                  .replace(/^browser:\/\//i, 'browser.app/')
                  .replace(/^https?:\/\/notes\.app\//i, '')
                  .replace(/^notes\.app\//i, '')
                  .replace(/^\/notes\.app\//i, '');
                segments = normalized.split('/').filter(Boolean);
              }
              if (segments.length === 0) return;
              const targetPath = ['~', ...segments];
              openApp?.('notes', { path: targetPath });
            }}
          />
        </Suspense>
      </div>

      {/* Floating Save button for new/unsaved note */}
      {!path && (
        <div className="absolute bottom-3 right-3 z-[60]">
          <Button size="sm" variant="primary" onClick={save}>Save</Button>
        </div>
      )}

      {/* In-app File Picker overlay */}
      {showPicker && (
        <div className="absolute inset-0 z-[80]"><FilePicker
          initialPath={['~']}
          mode="save"
          filterExt={[".notes", ".md"]}
          suggestedName={stripExtension(filename) || 'Untitled'}
          onConfirm={(fullPath) => {
            const segments = [...fullPath];
            const last = segments[segments.length - 1];
            if (!/\.(notes|md)$/i.test(last)) segments[segments.length - 1] = `${last}.notes`;
            if (segments.length > 1) mkdir(segments.slice(0, -1));
            writeFile(segments, draftContent);
            setPath(segments);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
        /></div>
      )}
    </div>
  );
};

export default Notes;


