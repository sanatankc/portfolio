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
  diffSourcePlugin
} from '@mdxeditor/editor';

interface NotesMdxEditorProps {
  value: string;
  onChange: (next: string) => void;
}

const NotesMdxEditor: React.FC<NotesMdxEditorProps> = ({ value, onChange }) => {
  // Guard against setState loops by passing stable onChange
  const handleChange = React.useCallback((next: string) => {
    if (next === value) return; // avoid spurious updates
    onChange(next);
  }, [onChange, value]);
  // return <div></div></dib>

  return (
    <div className="relative w-full h-full z-[1000]">
      <MDXEditor
        className="w-full h-full"
        contentEditableClassName="font-mono text-sm p-3 prose"
        markdown={value}
        onChange={handleChange}
        plugins={[
          diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
          markdownShortcutPlugin(),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'markdown' }),
          tablePlugin(),
        ] as MDXEditorProps['plugins']}
      />
    </div>
  );
};

export default NotesMdxEditor;


