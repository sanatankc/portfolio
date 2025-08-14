'use client';

import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  uiSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<InputProps['uiSize']>, string> = {
  sm: 'px-2 py-1 text-[12px]',
  md: 'px-2 py-1.5 text-[13px]',
  lg: 'px-3 py-2 text-[14px]',
};

const base = 'font-mono border-pixel-sm-[#c0c0c0] bg-[#f5f5f5] text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, uiSize = 'md', ...props }, ref) => {
    return (
      <input ref={ref} className={clsx(base, sizeClasses[uiSize], className)} {...props} />
    );
  }
);

Input.displayName = 'Input';

export default Input;


