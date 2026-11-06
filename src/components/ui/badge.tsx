import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'vip' | 'low';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#0f6b5c] text-white border-transparent',
    secondary: 'bg-[#e4f0ed] text-[#0f6b5c] border-transparent',
    outline: 'border border-[#dde4e2] text-[#14302b]',
    pending: 'bg-[#fdf0d8] text-[#8a5a00] border-[#f5dfb8]',
    shipped: 'bg-[#dce9fa] text-[#2f6fc8] border-[#c4dcfa]',
    delivered: 'bg-[#d9f0e3] text-[#2e8b57] border-[#bfe5d1]',
    cancelled: 'bg-[#f8dfda] text-[#c8442f] border-[#f2c1b8]',
    vip: 'bg-[#d9f0e3] text-[#2e8b57] border-[#bfe5d1]',
    low: 'bg-[#f8dfda] text-[#c8442f] border-[#f2c1b8]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

