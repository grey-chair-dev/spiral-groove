import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, ...props }, ref) => {
    const selectId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-body font-medium text-text-dark"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            'w-full px-3 py-2 rounded-small border border-neutral-300 bg-primary-cream text-text-dark focus:outline-none focus:ring-2 focus:ring-accent-teal focus:border-accent-teal transition-150',
            error && 'border-highlight-red focus:ring-highlight-red focus:border-highlight-red',
            className
          )}
          ref={ref}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export { Select };
