'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-sapphire hover:bg-sapphire-light text-white shadow-sapphire-glow border border-sapphire-light/30',
        emerald:
          'bg-emerald hover:bg-emerald-light text-black font-semibold shadow-emerald-glow border border-emerald-light/30',
        glass:
          'bg-white/5 hover:bg-white/10 text-foreground border border-white/10 backdrop-blur-md shadow-glass',
        glassEmerald:
          'bg-emerald/10 hover:bg-emerald/20 text-emerald-light border border-emerald/30 backdrop-blur-md',
        glassSapphire:
          'bg-sapphire/10 hover:bg-sapphire/20 text-sapphire-light border border-sapphire/30 backdrop-blur-md',
        outline:
          'border border-white/20 bg-transparent hover:bg-white/5 text-foreground',
        ghost:
          'hover:bg-white/10 text-foreground',
        danger:
          'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base font-medium',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
