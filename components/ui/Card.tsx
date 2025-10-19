import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'product' | 'event' | 'blog';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-large shadow-card border border-neutral-200 bg-primary-cream transition-200';
    
    const variants = {
      default: 'p-6',
      product: 'overflow-hidden group',
      event: 'p-6',
      blog: 'p-6'
    };
    
    const hoverClasses = hover ? 'hover:shadow-card-hover hover:-translate-y-1' : '';
    
    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          hoverClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Product Card specific component
interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: React.ReactNode;
  title: string;
  artist?: string;
  price: string;
  description?: string;
  children?: React.ReactNode;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, image, title, artist, price, description, children, ...props }, ref) => {
    return (
      <Card
        variant="product"
        hover
        className={cn('group', className)}
        ref={ref}
        {...props}
      >
        <div className="aspect-[4/3] overflow-hidden rounded-t-large">
          {image || (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <div className="text-neutral-400 text-sm">No Image</div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-accent font-semibold text-lg mb-1 group-hover:text-accent-teal transition-150">
            {title}
          </h3>
          {artist && (
            <p className="text-neutral-600 text-sm mb-2">{artist}</p>
          )}
          {description && (
            <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-accent font-bold text-lg text-accent-teal">{price}</span>
            {children}
          </div>
        </div>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';

// Event Card specific component
interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: React.ReactNode;
  title: string;
  date: string;
  location?: string;
  description?: string;
  children?: React.ReactNode;
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ className, image, title, date, location, description, children, ...props }, ref) => {
    return (
      <Card
        variant="event"
        hover
        className={cn('group', className)}
        ref={ref}
        {...props}
      >
        {image && (
          <div className="aspect-[4/3] overflow-hidden rounded-t-large mb-4">
            {image}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-accent-amber text-text-dark px-2 py-1 rounded-full text-xs font-accent font-bold uppercase">
              {date}
            </span>
          </div>
          <h3 className="font-display font-semibold text-xl group-hover:text-accent-teal transition-150">
            {title}
          </h3>
          {location && (
            <p className="text-neutral-600 text-sm">{location}</p>
          )}
          {description && (
            <p className="text-neutral-600 text-sm line-clamp-2">{description}</p>
          )}
          {children}
        </div>
      </Card>
    );
  }
);

EventCard.displayName = 'EventCard';

export { Card, ProductCard, EventCard };
