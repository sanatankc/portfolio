'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { MediaGallery } from './MediaGallery';
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownRendererProps {
  content: string;
}

// Custom Alert component with terminal styling
const Alert = ({ type = 'info', children }: { type?: 'info' | 'warning' | 'error' | 'success'; children: React.ReactNode }) => {
  const promptColors = {
    info: 'text-green-500 dark:text-green-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    error: 'text-red-500 dark:text-red-400',
    success: 'text-green-500 dark:text-green-400'
  };

  const textColors = {
    info: 'text-slate-700 dark:text-slate-300',
    warning: 'text-slate-700 dark:text-slate-300',
    error: 'text-slate-700 dark:text-slate-300',
    success: 'text-slate-700 dark:text-slate-300'
  };

  return (
    <div className="p-4 my-6 font-mono">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm ${promptColors[type]}`}>$</span>
          <i className={`hn hn-angle-right text-sm ${promptColors[type]}`}></i>
        </div>
        <div className={`flex-1 text-sm leading-relaxed ${textColors[type]}`}>{children}</div>
      </div>
    </div>
  );
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Process Alert components
  let processedContent = content
    .replace(/<Alert type="info">/g, '<div class="alert-info">')
    .replace(/<Alert type="warning">/g, '<div class="alert-warning">')
    .replace(/<Alert type="error">/g, '<div class="alert-error">')
    .replace(/<Alert type="success">/g, '<div class="alert-success">')
    .replace(/<\/Alert>/g, '</div>');

  // Process MediaGallery components - handle multiline syntax
  processedContent = processedContent.replace(
    /<MediaGallery[\s\S]*?\/>/g,
    (match) => {
      // Extract attributes
      const columnsMatch = match.match(/columns=\{(\d+)\}/);
      const widthMatch = match.match(/width=(?:\{['"](content|wide|full)['"]\}|['"](content|wide|full)['"])/);
      const sizingMatch = match.match(/sizing=(?:\{['"](fixed|auto|aspect-ratio)['"]\}|['"](fixed|auto|aspect-ratio)['"])/);
      const objectFitMatch = match.match(/objectFit=(?:\{['"](cover|contain)['"]\}|['"](cover|contain)['"])/);
      const aspectRatioMatch = match.match(/aspectRatio=(?:\{['"]([\d\/]+)['"]\}|['"]([\d\/]+)['"])/);
      
      // Extract items array - look for items={...} with proper bracket matching
      let itemsContent = '';
      const itemsStart = match.indexOf('items={');
      if (itemsStart !== -1) {
        let bracketCount = 0;
        let i = itemsStart + 7; // Start after 'items={'
        let inArray = false;
        
        while (i < match.length) {
          const char = match[i];
          
          if (char === '[' && !inArray) {
            inArray = true;
            bracketCount = 1;
            itemsContent += char;
          } else if (inArray) {
            itemsContent += char;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
            
            if (bracketCount === 0) break;
          }
          i++;
        }
      }

      const columns = columnsMatch ? columnsMatch[1] : '1';
      const width = widthMatch ? (widthMatch[1] || widthMatch[2]) : 'content';
      const sizing = sizingMatch ? (sizingMatch[1] || sizingMatch[2]) : 'fixed';
      const objectFit = objectFitMatch ? (objectFitMatch[1] || objectFitMatch[2]) : 'cover';
      const aspectRatio = aspectRatioMatch ? (aspectRatioMatch[1] || aspectRatioMatch[2]).replace('/', '_') : '16_9';

      return `<div class="media-gallery columns-${columns} width-${width} sizing-${sizing} objectfit-${objectFit} aspectratio-${aspectRatio}" data-items='${itemsContent}'></div>`;
    }
  );

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Typography
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
          p: (props: any) => (
            <p className="font-satoshi text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6" {...props} />
          ),
          a: (props: any) => (
            <a 
              className="font-satoshi text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline underline-offset-2 decoration-2 hover:decoration-4 transition-all"
              target={props.href?.startsWith('http') ? '_blank' : '_self'}
              rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            />
          ),
          blockquote: (props: any) => (
            <blockquote className="p-4 my-6 font-mono">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-blue-500 dark:text-blue-400">$</span>
                  <i className="hn hn-angle-right text-sm text-blue-500 dark:text-blue-400"></i>
                </div>
                <div className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300" {...props} />
              </div>
            </blockquote>
          ),
          ul: (props: any) => (
            <ul className="font-satoshi text-base md:text-lg list-disc list-outside ml-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />
          ),
          ol: (props: any) => (
            <ol className="font-satoshi text-base md:text-lg list-decimal list-outside ml-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />
          ),
          li: (props: any) => (
            <li className="font-satoshi text-base md:text-lg leading-relaxed" {...props} />
          ),
          pre: (props: any) => (
            <pre className="pixel-corners--wrapper w-full p-2 overflow-x-auto font-mono text-sm leading-relaxed my-2" {...props} />
          ),
          code: (props: any) => {
            if (props.className?.startsWith('language-')) {
              return <code {...props} />;
            }
            return (
              <code className="bg-red-400 text-slate-800 dark:text-slate-200 px-2 py-1 rounded font-mono text-sm" {...props} />
            );
          },
          strong: (props: any) => (
            <strong className="font-satoshi font-bold" {...props} />
          ),
          em: (props: any) => (
            <em className="font-satoshi italic" {...props} />
          ),
          // Custom component handlers
          div: (props: any) => {
            // Alert component handler
            if (props.className?.includes('alert-')) {
              const type = props.className.split('alert-')[1] as 'info' | 'warning' | 'error' | 'success';
              return <Alert type={type}>{props.children}</Alert>;
            }
            
            // MediaGallery component handler
            if (props.className?.includes('media-gallery')) {
              
              const params = props.className.split(' ').reduce((acc: any, className: string) => {
                if (className.startsWith('columns-')) {
                  acc.columns = parseInt(className.split('-')[1]) as 1 | 2 | 3;
                }
                if (className.startsWith('width-')) {
                  acc.width = className.split('-')[1] as 'content' | 'wide' | 'full';
                }
                if (className.startsWith('sizing-')) {
                  acc.sizing = className.split('-')[1] as 'fixed' | 'auto' | 'aspect-ratio';
                }
                if (className.startsWith('objectfit-')) {
                  acc.objectFit = className.split('-')[1] as 'cover' | 'contain';
                }
                if (className.startsWith('aspectratio-')) {
                  acc.aspectRatio = className.split('-')[1].replace('_', '/'); // Convert back to ratio format
                }
                return acc;
              }, {});

              const itemsData = (props as any)['data-items'];
              
              if (itemsData) {
                try {
                  // Clean up the extracted content and convert JS object syntax to JSON
                  let cleanedData = itemsData.trim();
                  
                  // Convert unquoted object keys to quoted keys for valid JSON
                  // Match word characters followed by a colon (JS object key syntax)
                  cleanedData = cleanedData.replace(/(\w+):/g, '"$1":');
                  
                  const items = JSON.parse(cleanedData);
                  return <MediaGallery items={items} {...params} />;
                } catch (e) {
                  console.error('Failed to parse media gallery items:', e);
                  console.error('Raw itemsData that failed:', itemsData);
                  return <div>MediaGallery Error: Invalid items data</div>;
                }
              }
            }
            
            return <div {...props} />;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
} 