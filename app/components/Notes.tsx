'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppProps } from '@/app/lib/apps';
import { useFilesystem } from '@/app/lib/filesystem';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
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
  const { readFile, writeFile, mkdir } = useFilesystem();

  // Determine initial path (if opened from File Browser) else start as new Untitled note
  const initialPath = useMemo(() => (isNotesPayload(payload) && payload?.path) ? payload.path! : null, [payload]);

  const [path, setPath] = useState<string[] | null>(initialPath);
  const [content, setContent] = useState<string>('');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPath) {
      const existing = readFile(initialPath) ?? '';
      setContent(existing);
    } else {
      setContent('');
    }
  }, [initialPath, readFile]);

  const filename = useMemo(() => {
    if (path && path.length > 0) return path[path.length - 1];
    return 'Untitled.notes';
  }, [path]);

  // Update title from file name (without extension) or first markdown H1 if present
  useEffect(() => {
    const base = stripExtension(filename);
    let title = base || 'Untitled';
    const m = content.match(/^\s*#\s+(.+)$/m);
    if (m && m[1]) title = m[1].trim();
    setWindowTitle?.(title);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename, content]);

  const save = () => {
    if (!path) {
      setShowPicker(true);
      return;
    }
    writeFile(path, content);
  };

  const performSaveAs = () => {
    setShowPicker(true);
  };

  const syncScroll = () => {
    if (!editorRef.current || !previewRef.current) return;
    const e = editorRef.current;
    const p = previewRef.current;
    const ratio = e.scrollTop / (e.scrollHeight - e.clientHeight || 1);
    p.scrollTop = ratio * (p.scrollHeight - p.clientHeight);
  };

  return (
    <div className="w-full h-full flex flex-col font-mono">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700/30">
        <div className="text-xs opacity-70 truncate" title={filename}>{stripExtension(filename)}</div>
        <div className="flex-1" />
        <Button size="sm" variant="primary" onClick={save}>Save</Button>
        <Button size="sm" variant="secondary" onClick={performSaveAs}>Save As…</Button>
      </div>

      {/* MDX live editor (no transparent overlay) */}
      <div className="flex-1 min-h-0">
      <Suspense fallback={<div>Loading Editor ...</div>}>
        <NotesMdxEditor value={content} onChange={setContent} />
      </Suspense>
      </div>

      {/* In-app File Picker overlay */}
      {showPicker && (
        <FilePicker
          initialPath={['~']}
          mode="save"
          filterExt={[".notes", ".md"]}
          suggestedName={stripExtension(filename) || 'Untitled'}
          onConfirm={(fullPath) => {
            const segments = [...fullPath];
            const last = segments[segments.length - 1];
            if (!/\.(notes|md)$/i.test(last)) segments[segments.length - 1] = `${last}.notes`;
            if (segments.length > 1) mkdir(segments.slice(0, -1));
            writeFile(segments, content);
            setPath(segments);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

export default Notes;


