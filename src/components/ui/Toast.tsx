import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ViewMode } from '../../../types';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  viewMode: ViewMode;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, viewMode }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 pr-12 pl-4 py-4 min-w-[300px] relative
        ${viewMode === 'retro' 
          ? 'bg-brand-black text-brand-cream border-2 border-brand-orange shadow-retro' 
          : 'bg-white text-black border border-gray-200 shadow-xl rounded-lg'}
      `}>
        <div className={`p-1 rounded-full ${viewMode === 'retro' ? 'bg-brand-orange text-brand-black' : 'bg-green-100 text-green-600'}`}>
          <CheckCircle2 size={16} strokeWidth={3} />
        </div>
        
        <div className="flex flex-col">
          <span className={`font-bold text-sm uppercase tracking-wider ${viewMode === 'retro' ? 'font-header' : 'font-sans'}`}>
            Success
          </span>
          <span className={`text-sm ${viewMode === 'retro' ? 'text-gray-400' : 'text-gray-600'}`}>
            {message}
          </span>
        </div>

        <button 
          onClick={onClose}
          className={`absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors
            ${viewMode === 'retro' ? 'text-brand-orange' : 'text-gray-400'}
          `}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};