'use client';

// MDXEditor live markdown editor wrapper
// We keep the API minimal for Notes: value + onChange

import React from 'react';
import '@mdxeditor/editor/style.css';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { MDXEditorProps } from '@mdxeditor/editor';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  tablePlugin,
  // diffSourcePlugin,
  thematicBreakPlugin
} from '@mdxeditor/editor';
import { useDesktopSettings } from '@/app/lib/store';

interface NotesMdxEditorProps {
  value: string;
  onChange: (next: string) => void;
  readOnly?: boolean;
  onOpenInternalLink?: (href: string) => void;
}

const NotesMdxEditor: React.FC<NotesMdxEditorProps> = ({ value, onChange, readOnly, onOpenInternalLink }) => {
  // Guard against setState loops by passing stable onChange
  const handleChange = React.useCallback((next: string) => {
    if (next === value) return; // avoid spurious updates
    onChange(next);
  }, [onChange, value]);

  // Apply appropriate text color based on light/dark mode
  const mode = useDesktopSettings((s) => s.mode);
  const textColorClass = mode === 'dark' ? 'text-white' : 'text-black';

  const plugins = React.useMemo(() => [
    // Avoid re-creating plugin instances on every render
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    thematicBreakPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'markdown' }),
    markdownShortcutPlugin(),
    tablePlugin(),
  ] as MDXEditorProps['plugins'], []);

  return (
    <div
      className="relative w-full h-full"
      onClick={(e) => {
        const target = e.target as HTMLElement | null;
        const anchor = target ? target.closest('a') as HTMLAnchorElement | null : null;
        if (!anchor) return;
        const hrefAttr = anchor.getAttribute('href') || '';
        const hrefAbs = anchor.href || '';
        
        const shouldIntercept = (() => {
          if (hrefAttr.startsWith('notes://') || hrefAttr.startsWith('browser://')) return true;
          try {
            const url = new URL(hrefAbs);
            if (url.hostname === 'notes.app' || url.hostname.endsWith('.notes.app')) return true;
            if (url.hostname === 'browser.app' || url.hostname.endsWith('.browser.app')) return true;
            if (url.pathname.startsWith('/notes.app/')) return true;
            if (url.pathname.startsWith('/browser.app/')) return true;
          } catch {
            // ignore
          }
          if (hrefAttr.startsWith('notes.app/')) return true; // relative style
          if (hrefAttr.startsWith('/notes.app/')) return true; // relative leading slash
          if (hrefAttr.startsWith('browser.app/')) return true; // relative style
          if (hrefAttr.startsWith('/browser.app/')) return true; // relative leading slash
          return false;
        })();

        if (shouldIntercept) {
          e.preventDefault();
          e.stopPropagation();
          onOpenInternalLink?.(hrefAbs || hrefAttr);
          return;
        }

        // Open external http(s) links in a new tab
        const isHttpExternal = /^https?:\/\//i.test(hrefAttr || hrefAbs);
        if (isHttpExternal) {
          try {
            const { hostname } = new URL(hrefAbs || hrefAttr);
            const host = hostname.toLowerCase();
            const isInternalHost = (
              host === 'notes.app' || host.endsWith('.notes.app') ||
              host === 'browser.app' || host.endsWith('.browser.app')
            );
            if (!isInternalHost) {
              e.preventDefault();
              e.stopPropagation();
              window.open(hrefAbs || hrefAttr, '_blank', 'noopener,noreferrer');
            }
          } catch {
            // If URL parsing fails, let default behavior occur
          }
        }
      }}
    >
      <MDXEditor
        className="w-full h-full"
        contentEditableClassName={`font-mono text-sm p-3 prose break-words whitespace-pre-wrap overflow-auto ${textColorClass}`}
        markdown={value}
        onChange={handleChange}
        readOnly={readOnly}
        plugins={plugins}
      />
    </div>
  );
};

export default NotesMdxEditor;


