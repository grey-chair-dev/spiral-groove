/**
 * Input Component
 * Reusable input with neon styling and validation states
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-dark-800 px-4 py-3 text-dark-50 placeholder-dark-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-dark-600 focus:border-neon-cyan focus:ring-neon-cyan/20',
        neon: 'input-neon focus:shadow-neon-sm',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
        warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    loading = false,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-dark-200"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              inputVariants({ variant, size, className }),
              leftIcon && 'pl-10',
              (rightIcon || loading) && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          
          {(rightIcon || loading) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-2 text-sm">
            {error && (
              <p className="text-red-400">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-dark-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
