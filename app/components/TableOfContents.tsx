'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  showIntroduction?: boolean;
}

export function TableOfContents({ content, showIntroduction = false }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // Extract headings from content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    // Add Introduction section if enabled and content doesn't start with a heading
    if (showIntroduction) {
      const firstLineMatch = content.trim().match(/^#{1,6}\s+/);
      if (!firstLineMatch) {
        items.push({ 
          id: 'introduction', 
          text: 'Introduction', 
          level: 1 
        });
      }
    }

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length - 1;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      items.push({ id, text, level });
    }

    setTocItems(items);
  }, [content, showIntroduction]);

  // Handle scroll to update active heading
  useEffect(() => {
    const handleScroll = () => {
      const headings = tocItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading && heading.offsetTop <= scrollPosition) {
          setActiveId(tocItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  // Add IDs to headings in the DOM
  useEffect(() => {
    tocItems.forEach(item => {
      if (item.id === 'introduction') {
        // For introduction, find the first content element (usually the first paragraph)
        const articleElement = document.querySelector('article');
        if (articleElement && !document.getElementById('introduction')) {
          const firstParagraph = articleElement.querySelector('p, div');
          if (firstParagraph) {
            // Create an invisible anchor for the introduction
            const anchor = document.createElement('div');
            anchor.id = 'introduction';
            anchor.style.position = 'absolute';
            anchor.style.top = '0';
            anchor.style.visibility = 'hidden';
            articleElement.insertBefore(anchor, articleElement.firstChild);
          }
        }
      } else {
        const heading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          .find(h => h.textContent?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') === item.id);
        
        if (heading && !heading.id) {
          heading.id = item.id;
        }
      }
    });
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <>
      {/* Always visible indicator lines */}
      <div className="fixed right-1 top-1/2 -translate-y-1/2 z-40">
        <div className="flex flex-col gap-2">
          {tocItems.map((item) => (
            <div
              key={item.id}
              className={`w-4 h-0.5 rounded-full cursor-pointer transition-all duration-200 ${
                activeId === item.id
                  ? 'bg-blue-500 dark:bg-blue-400'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
              onClick={() => scrollToHeading(item.id)}
              onMouseEnter={() => setIsVisible(true)}
              onMouseLeave={() => setIsVisible(false)}
              title={item.text}
            />
          ))}
        </div>
      </div>

      {/* Hover trigger area around indicators */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 w-12 z-30"
        style={{ height: `${tocItems.length * 16 + 32}px` }}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />

      {/* TOC Panel */}
      <div
        ref={tocRef}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-l-xl shadow-xl max-w-xs w-80 max-h-96 overflow-y-auto">

          
          <div className="p-2">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left p-2 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  activeId === item.id
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                style={{
                  paddingLeft: `${8 + (item.level - 1) * 16}px`,
                }}
              >
                <span className="font-satoshi text-sm leading-tight block">
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 