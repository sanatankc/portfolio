'use client';

import React from 'react';
import clsx from 'clsx';

type TextVariant = 'label' | 'muted' | 'body' | 'title' | 'subtitle';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TextVariant;
}

const variantClasses: Record<TextVariant, string> = {
  label: 'font-mono text-[12px] uppercase tracking-wide',
  muted: 'text-slate-600',
  body: 'text-[13px] font-mono',
  title: 'text-lg font-semibold',
  subtitle: 'text-sm text-slate-700',
};

export const Text: React.FC<TextProps> = ({ className, children, variant = 'body', ...props }) => (
  <span className={clsx(variantClasses[variant], className)} {...props}>{children}</span>
);

export default Text;


