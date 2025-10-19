import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-body font-medium text-text-dark"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'w-full px-3 py-2 rounded-small border border-neutral-300 bg-primary-cream text-text-dark placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal transition-150',
            error && 'border-highlight-red focus:ring-highlight-red focus:border-highlight-red',
            className
          )}
          ref={ref}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-highlight-red flex items-center gap-1">
            <span className="text-highlight-red">!</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-neutral-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
