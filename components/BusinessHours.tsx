"use client";

import { useState } from 'react';
import { useBusinessHours } from '@/lib/hooks/useBusinessHours';
import { getFormattedHours, getCompactHours, isStoreOpen } from '@/lib/google-business';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BusinessHoursProps {
  variant?: 'full' | 'compact';
  showStatus?: boolean;
  className?: string;
}

export default function BusinessHours({ 
  variant = 'full', 
  showStatus = false,
  className = '' 
}: BusinessHoursProps) {
  const { hours, loading, error } = useBusinessHours();
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <p className="text-sm text-neutral-600">Hours unavailable</p>
      </div>
    );
  }

  const displayHours = variant === 'compact' ? getCompactHours(hours) : getFormattedHours(hours);
  const isOpen = isStoreOpen(hours);
  
  // Get today's hours
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = hours[today as keyof typeof hours] || 'Closed';

  return (
    <div className={`${className}`}>
      {showStatus && (
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-text-dark">
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      )}
      
      {/* Today's Hours - Always Visible */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-dark">
            Today ({today.charAt(0).toUpperCase() + today.slice(1)})
          </span>
          <span className="text-sm text-neutral-600">{todayHours}</span>
        </div>
      </div>

      {/* Full Hours Dropdown */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-accent-teal hover:text-accent-amber transition-colors"
        >
          {isExpanded ? 'Hide' : 'Show'} full hours
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {Object.entries(hours).map(([day, hours]) => {
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              const isToday = day === today;
              return (
                <div key={day} className={`flex justify-between items-center py-1 ${isToday ? 'bg-accent-teal/10 rounded px-2' : ''}`}>
                  <span className={`text-sm font-medium ${isToday ? 'text-accent-teal' : 'text-text-dark'}`}>
                    {dayName}
                  </span>
                  <span className="text-sm text-neutral-600">{hours}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
