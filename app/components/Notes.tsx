'use client';

import React, { useMemo, useState } from 'react';
import { AppProps } from '@/app/lib/apps';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
}

const defaultNotes: NoteItem[] = [
  { id: 'welcome', title: 'Welcome', content: 'Welcome to Notes. Create and view notes here.' },
];

interface NotesPayload { notes?: NoteItem[] }
function isNotesPayload(value: unknown): value is NotesPayload {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!('notes' in obj)) return true;
  const n = (obj as { notes?: unknown }).notes;
  if (n === undefined) return true;
  if (!Array.isArray(n)) return false;
  return n.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    const it = item as Partial<NoteItem>;
    return typeof it.id === 'string' && typeof it.title === 'string' && typeof it.content === 'string';
  });
}

const Notes: React.FC<AppProps> = ({ fx, payload, openApp }) => {
  void fx;
  const initialNotes = useMemo<NoteItem[]>(() => {
    const incoming = isNotesPayload(payload) ? payload?.notes : undefined;
    return incoming && incoming.length > 0 ? incoming : defaultNotes;
  }, [payload]);

  const [active] = useState<NoteItem>(initialNotes[0]);

  return (
    <div className="w-full h-full font-mono">
      <main className="p-4 overflow-auto prose prose-invert max-w-none">
        {active && (
          <article>
            <div className="text-sm whitespace-pre-wrap">
              <div
                className="space-y-3"
                onClick={(e) => {
                  const el = e.target as HTMLElement;
                  if (el.tagName.toLowerCase() === 'a') {
                    const anchor = el as HTMLAnchorElement;
                    const href = anchor.getAttribute('href') || '';
                    const target = anchor.getAttribute('target');
                    if (!target && href.startsWith('/blog/')) {
                      e.preventDefault();
                      openApp('browser', { url: href });
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ __html: active.content }}
              />
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default Notes;


