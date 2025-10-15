/**
 * Button Component
 * Reusable button with multiple variants and neon effects
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
        outline: 'border border-dark-600 bg-transparent text-dark-50 hover:bg-dark-700 hover:text-white',
        secondary: 'bg-dark-700 text-dark-50 hover:bg-dark-600 shadow-md hover:shadow-lg',
        ghost: 'text-dark-50 hover:bg-dark-700 hover:text-white',
        link: 'text-primary-500 underline-offset-4 hover:underline',
        neon: 'btn-neon btn-neon-cyan',
        'neon-pink': 'btn-neon btn-neon-pink',
        'neon-green': 'btn-neon btn-neon-green',
        'neon-purple': 'btn-neon btn-neon-purple',
        'neon-orange': 'btn-neon text-neon-orange border-neon-orange hover:bg-neon-orange hover:text-dark-900',
        'neon-yellow': 'btn-neon text-neon-yellow border-neon-yellow hover:bg-neon-yellow hover:text-dark-900',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        'pulse-neon': 'pulse-neon',
        bounce: 'animate-bounce',
        float: 'float',
        glow: 'hover:shadow-neon',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
