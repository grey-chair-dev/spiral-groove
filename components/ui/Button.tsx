import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-accent font-bold uppercase transition-150 focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-accent-teal text-text-light border border-accent-teal hover:bg-accent-amber hover:border-accent-amber',
      secondary: 'bg-transparent text-accent-teal border border-accent-teal hover:bg-accent-amber hover:border-accent-amber hover:text-text-dark',
      text: 'bg-transparent text-accent-teal underline underline-offset-4 hover:no-underline hover:text-accent-amber border-none p-0'
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-small',
      md: 'px-7 py-3.5 text-base rounded-medium',
      lg: 'px-8 py-4 text-lg rounded-medium'
    };
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
