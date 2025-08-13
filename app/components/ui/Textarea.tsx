'use client';

import React from 'react';
import clsx from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<TextareaProps['size']>, string> = {
  sm: 'px-2 py-1 text-[12px]',
  md: 'px-2 py-1.5 text-[13px]',
  lg: 'px-3 py-2 text-[14px]',
};

const base = 'font-mono border-pixel-sm-[#c0c0c0] bg-white text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <textarea ref={ref} className={clsx(base, sizeClasses[size], className)} {...props} />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;


