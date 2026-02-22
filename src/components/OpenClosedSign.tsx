import React, { useState, useEffect } from 'react';
import { isStoreOpenNow } from '../utils/storeHours';

type OpenClosedSignProps = {
  /** Optional: compact style for tight spaces (e.g. mobile) */
  compact?: boolean;
  /** Optional: match retro view mode styling */
  retro?: boolean;
  className?: string;
};

/**
 * Displays OPEN (with animation) or CLOSED based on store hours in Eastern time.
 * Updates every minute so the sign flips at open/close.
 */
export const OpenClosedSign: React.FC<OpenClosedSignProps> = ({
  compact = false,
  retro = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsOpen(isStoreOpenNow());
    update();
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isOpen === null) {
    return (
      <span
        className={`inline-block rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500 ${className}`}
        aria-hidden
      >
        —
      </span>
    );
  }

  if (isOpen) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded border-2 font-display font-bold uppercase tracking-wider neon-pulse
          ${retro ? 'border-brand-black bg-brand-teal text-brand-black shadow-retro' : 'border-brand-teal bg-brand-teal/15 text-brand-teal'}
          ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
          ${className}`}
        aria-live="polite"
        aria-label="Store is open"
      >
        <span className="drop-shadow-[0_0_6px_currentColor]">Open</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded border-2 font-display font-bold uppercase tracking-wider
        ${retro ? 'border-brand-black bg-brand-red/20 text-brand-red shadow-retro' : 'border-gray-400 bg-gray-100 text-gray-600'}
        ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
        ${className}`}
      aria-live="polite"
      aria-label="Store is closed"
    >
      Closed
    </span>
  );
};
