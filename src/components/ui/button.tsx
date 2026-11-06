import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  const variantStyles = {
    default: 'bg-[#0f6b5c] text-white hover:bg-[#0b5146] shadow-2xs',
    accent: 'bg-[#f2a33a] text-[#2b1c00] hover:bg-[#e39328] font-bold shadow-2xs',
    outline: 'border border-[#dde4e2] bg-white text-[#14302b] hover:bg-[#f3f5f4]',
    secondary: 'bg-[#e4f0ed] text-[#0f6b5c] hover:bg-[#d5e7e3]',
    ghost: 'text-[#14302b] hover:bg-[#f3f5f4]',
    destructive: 'bg-[#c8442f] text-white hover:bg-[#b03723]',
  };

  const sizeStyles = {
    default: 'h-9 px-4 py-2 text-xs font-semibold rounded-lg',
    sm: 'h-7 px-3 text-xs rounded-md',
    lg: 'h-11 px-6 text-sm rounded-xl',
    icon: 'h-8 w-8 rounded-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-98',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

