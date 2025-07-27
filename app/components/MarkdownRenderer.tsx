'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

// Custom Alert component
const Alert = ({ type = 'info', children }: { type?: 'info' | 'warning' | 'error' | 'success'; children: React.ReactNode }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  return (
    <div className={`border-l-4 p-4 my-6 rounded-r-lg ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1 font-satoshi text-base leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

// Custom components for react-markdown with proper types
const components: any = {
  // Headings with retro/glitchy styling (Chicago Plain font)
  h1: (props: any) => (
    <h1 className="font-mono text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-6 first:mt-0" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="font-mono text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="font-mono text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="font-mono text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2" {...props} />
  ),
  h5: (props: any) => (
    <h5 className="font-mono text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2" {...props} />
  ),
  h6: (props: any) => (
    <h6 className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1" {...props} />
  ),
  
  // Body text with Satoshi - excellent for readability
  p: (props: any) => (
    <p className="font-satoshi text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6" {...props} />
  ),
  
  // Links with readable font
  a: (props: any) => (
    <a 
      className="font-satoshi text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline underline-offset-2 decoration-2 hover:decoration-4 transition-all"
      target={props.href?.startsWith('http') ? '_blank' : '_self'}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    />
  ),
  
  // Code blocks with monospace
  pre: (props: any) => (
    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-6 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700 font-mono text-sm leading-relaxed my-8" {...props} />
  ),
  
  // Inline code with monospace
  code: (props: any) => {
    // If it's a code block (has language class), return as-is for highlighting
    if (props.className?.startsWith('language-')) {
      return <code {...props} />;
    }
    // Otherwise, it's inline code
    return (
      <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded font-mono text-sm" {...props} />
    );
  },
  
  // Blockquotes with readable font
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-4 my-8 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg font-satoshi text-base md:text-lg italic text-slate-700 dark:text-slate-300" {...props} />
  ),
  
  // Lists with readable font
  ul: (props: any) => (
    <ul className="font-satoshi text-base md:text-lg list-disc list-outside ml-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />
  ),
  ol: (props: any) => (
    <ol className="font-satoshi text-base md:text-lg list-decimal list-outside ml-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />
  ),
  li: (props: any) => (
    <li className="font-satoshi text-base md:text-lg leading-relaxed" {...props} />
  ),
  
  // Tables with readable font
  table: (props: any) => (
    <div className="overflow-x-auto my-8">
      <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 font-satoshi text-sm md:text-base" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-4 py-3 text-left font-mono font-bold text-sm md:text-base" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-satoshi text-sm md:text-base" {...props} />
  ),
  
  // Strong and emphasis with readable font
  strong: (props: any) => (
    <strong className="font-satoshi font-bold" {...props} />
  ),
  em: (props: any) => (
    <em className="font-satoshi italic" {...props} />
  ),
  
  // Custom Alert component parser
  div: (props: any) => {
    if (props.className?.includes('alert-')) {
      const type = props.className.split('alert-')[1] as 'info' | 'warning' | 'error' | 'success';
      return <Alert type={type}>{props.children}</Alert>;
    }
    return <div {...props} />;
  }
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Pre-process content to handle custom Alert components
  const processedContent = content
    .replace(/<Alert type="info">([\s\S]*?)<\/Alert>/g, '<div class="alert-info">$1</div>')
    .replace(/<Alert type="warning">([\s\S]*?)<\/Alert>/g, '<div class="alert-warning">$1</div>')
    .replace(/<Alert type="error">([\s\S]*?)<\/Alert>/g, '<div class="alert-error">$1</div>')
    .replace(/<Alert type="success">([\s\S]*?)<\/Alert>/g, '<div class="alert-success">$1</div>');

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
} 