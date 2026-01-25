import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase";
  
  const variants = {
    primary: "bg-brand-orange text-white border-2 border-brand-black shadow-retro hover:shadow-retro-hover hover:bg-brand-red rounded-full",
    secondary: "bg-brand-mustard text-brand-black border-2 border-brand-black shadow-retro hover:shadow-retro-hover hover:bg-brand-pink rounded-full",
    outline: "bg-transparent border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-cream rounded-full",
    ghost: "bg-transparent text-brand-black hover:bg-brand-black/5 rounded-full",
    link: "bg-transparent text-brand-black underline-offset-4 hover:text-brand-orange p-0 border-0 shadow-none normal-case tracking-normal"
  };

  const sizes = {
    sm: "text-[10px] px-4 py-2",
    md: "text-xs px-6 py-3",
    lg: "text-sm px-8 py-4"
  };

  // Link variant overrides size padding
  const computedSize = variant === 'link' ? "text-sm" : sizes[size];

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${computedSize} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};