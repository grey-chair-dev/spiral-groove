import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({ children, className = "", id, containerClassName = "" }) => {
  return (
    <section id={id} className={`py-10 md:py-24 ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
};