import React from 'react';
import { ViewMode } from '../../../types';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  viewMode?: ViewMode;
}

export const Section: React.FC<SectionProps> = ({ children, className = "", id, containerClassName = "", viewMode }) => {
  const isRetro = viewMode === 'retro';
  const hasBackgroundColor = /bg-\w+/.test(className);
  const shouldApplyBackgroundImage = isRetro && !hasBackgroundColor;
  const hasBorder = /border/.test(className);
  
  return (
    <section 
      id={id} 
      className={`py-10 md:py-24 ${className} ${shouldApplyBackgroundImage ? 'bg-cover bg-center bg-no-repeat' : ''} ${isRetro && !hasBorder ? 'border-t-2 section-alt2' : ''}`}
      style={shouldApplyBackgroundImage 
        ? { 
            backgroundImage: 'url(/bg-linen-black.avif)',
            borderTopWidth: isRetro && !hasBorder ? '2px' : undefined,
          } 
        : isRetro && !hasBorder
          ? {
              borderTopWidth: '2px',
            }
          : undefined
      }
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
};