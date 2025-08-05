import type { MDXComponents } from 'mdx/types';
import { MediaGallery } from './app/components/MediaGallery';

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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Typography with proper fonts
    h1: (props) => (
      <h1 className="font-mono text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-6 first:mt-0" {...props} />
    ),
    h2: (props) => (
      <h2 className="font-mono text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4" {...props} />
    ),
    h3: (props) => (
      <h3 className="font-mono text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3" {...props} />
    ),
    h4: (props) => (
      <h4 className="font-mono text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2" {...props} />
    ),
    h5: (props) => (
      <h5 className="font-mono text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2" {...props} />
    ),
    h6: (props) => (
      <h6 className="font-mono text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1" {...props} />
    ),
    p: (props) => (
      <p className="font-satoshi text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6" {...props} />
    ),
    a: (props) => (
      <a 
        className="font-satoshi text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline underline-offset-2 decoration-2 hover:decoration-4 transition-all"
        target={props.href?.startsWith('http') ? '_blank' : '_self'}
        rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-4 my-8 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg font-satoshi text-base md:text-lg italic text-slate-700 dark:text-slate-300" {...props} />
    ),
    ul: (props) => (
      <ul className="font-satoshi text-base md:text-lg list-disc list-outside ml-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />
    ),
    ol: (props) => (
      <ol className="font-satoshi text-base md:text-lg list-decimal list-outside ml-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300" {...props} />
    ),
    li: (props) => (
      <li className="font-satoshi text-base md:text-lg leading-relaxed" {...props} />
    ),
    pre: (props) => (
      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-6 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700 font-mono text-sm leading-relaxed my-8" {...props} />
    ),
    code: (props) => {
      if (props.className?.startsWith('language-')) {
        return <code {...props} />;
      }
      return (
        <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded font-mono text-sm" {...props} />
      );
    },
    strong: (props) => (
      <strong className="font-satoshi font-bold" {...props} />
    ),
    em: (props) => (
      <em className="font-satoshi italic" {...props} />
    ),
    
    // Custom components
    MediaGallery,
    Alert,
    
    ...components,
  };
} 