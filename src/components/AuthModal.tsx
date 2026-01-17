
import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { Button } from './ui/Button';
import { ViewMode, User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  viewMode: ViewMode;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, viewMode }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API calls
    setTimeout(() => {
      setIsLoading(false);
      
      if (mode === 'forgot-password') {
        setResetSent(true);
        // Reset after 3 seconds or let user navigate back
        setTimeout(() => {
           // Optional: Auto close or switch back
        }, 3000);
      } else {
        onLogin({
          id: 'u1',
          name: mode === 'login' ? 'Vinyl Lover' : formData.name,
          email: formData.email,
          avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'
        });
        onClose();
      }
    }, 800);
  };

  const isRetro = viewMode === 'retro';

  const getTitle = () => {
    switch(mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Join the Club';
      case 'forgot-password': return 'Reset Password';
    }
  };

  const resetForm = () => {
    setMode('login');
    setResetSent(false);
    setFormData({ name: '', email: '', password: '' });
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className={`relative w-full max-w-md animate-in zoom-in-95 duration-200
        ${isRetro 
          ? 'bg-brand-cream border-2 border-brand-black shadow-retro' 
          : 'bg-white rounded-2xl shadow-2xl'}
      `}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b
           ${isRetro ? 'border-brand-black/10' : 'border-gray-100'}
        `}>
          <div className="flex items-center gap-3">
             {mode === 'forgot-password' && (
               <button 
                 onClick={resetForm}
                 className={`p-1 rounded-full transition-colors ${isRetro ? 'hover:text-brand-orange' : 'hover:text-black text-gray-400'}`}
               >
                 <ArrowLeft size={20} />
               </button>
             )}
             <h2 className={`font-display text-2xl md:text-3xl
                ${isRetro ? 'text-brand-black' : 'text-gray-900'}
             `}>
                {getTitle()}
             </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-3 sm:p-2 rounded-full transition-colors -mr-2 sm:mr-0
              ${isRetro ? 'hover:bg-brand-black/5' : 'hover:bg-gray-100'}
            `}
            aria-label="Close modal"
          >
            <X size={24} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {resetSent && mode === 'forgot-password' ? (
             <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full border-2
                   ${isRetro ? 'bg-brand-mustard border-brand-black shadow-pop-sm' : 'bg-green-100 border-green-200'}
                `}>
                   <Send size={28} className={isRetro ? 'text-brand-black' : 'text-green-600'} />
                </div>
                <h3 className="font-display text-xl mb-2">Check your inbox!</h3>
                <p className="text-gray-500 mb-8">We've sent a password reset link to <br/><strong>{formData.email}</strong></p>
                <Button 
                   fullWidth 
                   variant={isRetro ? 'outline' : 'ghost'} 
                   onClick={resetForm}
                >
                   Back to Sign In
                </Button>
             </div>
          ) : (
            <>
              {mode === 'forgot-password' && (
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Don't worry, it happens to the best of us. Enter your email and we'll help you get back to your collection.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-5">
                
                {mode === 'register' && (
                  <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Name</label>
                    <div className="relative">
                      <UserIcon size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 sm:py-3 text-base sm:text-sm font-medium focus:outline-none transition-all
                            ${isRetro 
                              ? 'bg-white border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                              : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                        `}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">Email</label>
                  <div className="relative">
                    <Mail size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className={`w-full pl-12 pr-4 py-4 sm:py-3 text-base sm:text-sm font-medium focus:outline-none transition-all
                          ${isRetro 
                            ? 'bg-white border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                            : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                      `}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {mode !== 'forgot-password' && (
                  <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70">Password</label>
                      {mode === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => setMode('forgot-password')}
                          className="text-xs font-bold text-brand-orange hover:underline px-2 -mr-2 py-1"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                      <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 sm:py-3 text-base sm:text-sm font-medium focus:outline-none transition-all
                            ${isRetro 
                              ? 'bg-white border-2 border-brand-black focus:shadow-pop-sm placeholder-brand-black/30' 
                              : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                        `}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  fullWidth 
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className={`mt-6 sm:mt-4 h-14 sm:h-auto text-base ${isRetro ? 'shadow-pop hover:shadow-pop-hover hover:translate-x-0 hover:translate-y-0' : 'shadow-lg'}`}
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? 'Processing...' : (
                      <>
                        {mode === 'login' && 'Sign In'}
                        {mode === 'register' && 'Create Account'}
                        {mode === 'forgot-password' && 'Send Reset Link'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  {mode === 'login' && "Don't have an account?"}
                  {mode === 'register' && "Already have an account?"}
                  {mode === 'forgot-password' && "Remembered your password?"}
                </p>
                <button 
                  onClick={() => {
                    if (mode === 'forgot-password') setMode('login');
                    else setMode(mode === 'login' ? 'register' : 'login');
                  }}
                  className={`w-full py-3 sm:py-2 text-sm font-bold uppercase tracking-wider transition-colors border rounded-lg sm:border-0 sm:bg-transparent
                    ${isRetro 
                        ? 'border-brand-black bg-white text-brand-black hover:bg-brand-black hover:text-white sm:hover:bg-transparent sm:hover:text-brand-orange' 
                        : 'border-gray-200 text-black hover:bg-gray-50 sm:hover:bg-transparent sm:hover:text-gray-600'}
                  `}
                >
                  {mode === 'login' && 'Register Now'}
                  {mode === 'register' && 'Sign In Here'}
                  {mode === 'forgot-password' && 'Back to Sign In'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Decor (Desktop only) */}
        {isRetro && (
           <div className="absolute top-4 right-4 -z-10 w-full h-full bg-brand-black border-2 border-brand-black translate-x-2 translate-y-2 hidden sm:block"></div>
        )}
      </div>
    </div>
  );
};
