import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './button';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none backdrop-blur-md',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-white border border-white/10',
        sapphire: 'bg-sapphire/20 text-sapphire-light border border-sapphire/40 shadow-sm',
        emerald: 'bg-emerald/20 text-emerald-light border border-emerald/40 shadow-sm',
        outline: 'border border-white/20 text-neutral-300',
        active: 'bg-emerald/25 text-emerald-light border border-emerald/50 animate-pulse',
        idle: 'bg-neutral-800/80 text-neutral-400 border border-neutral-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
