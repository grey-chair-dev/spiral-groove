import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: 'primary' | 'secondary' | 'accent';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const backgroundVariants = {
  primary: 'bg-primary-cream text-primary-black',
  secondary: 'bg-primary-black text-primary-cream',
  accent: 'bg-accent-teal text-primary-cream',
};

const paddingVariants = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-20',
  xxl: 'py-24',
};

const maxWidthVariants = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-8xl',
  full: 'max-w-full',
};

export default function SectionWrapper({
  children,
  className,
  background = 'primary',
  padding = 'lg',
  maxWidth = 'xl',
}: SectionWrapperProps) {
  return (
    <section className={cn(
      'w-full',
      backgroundVariants[background],
      paddingVariants[padding]
    )}>
      <div className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthVariants[maxWidth],
        className
      )}>
        {children}
      </div>
    </section>
  );
}
