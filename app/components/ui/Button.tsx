'use client';

import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1',
  md: 'px-3 py-1.5',
  lg: 'px-4 py-2',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-black text-white hover:bg-black/90 border-pixel-sm-black',
  secondary: 'bg-white text-black hover:bg-slate-100 border-pixel-sm-[#c0c0c0]',
  ghost: 'bg-transparent text-black hover:bg-slate-100 border-pixel-sm-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-pixel-sm-red-700',
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'secondary',
  size = 'md',
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center select-none font-mono text-[13px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;


