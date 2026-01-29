
import React, { useState, useEffect } from 'react';
import { ViewMode, User, Page } from '../../types';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { User as UserIcon, Mail, Bell, Lock, Palette, Save, LogOut, Camera, ArrowLeft, Shield, Phone, Smartphone } from 'lucide-react';

interface SettingsPageProps {
  user: User | null;
  viewMode: ViewMode;
  onNavigate: (page: Page, filter?: string) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

type SettingsTab = 'profile' | 'notifications' | 'security' | 'preferences';

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, 
  viewMode, 
  onNavigate, 
  onLogout, 
  onUpdateUser 
}) => {
  const isRetro = viewMode === 'retro';
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    newsletter: true,
    notifications: true,
    communicationMethod: 'email' as 'email' | 'phone'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        newsletter: user.preferences?.newsletter ?? true,
        notifications: user.preferences?.notifications ?? true,
        communicationMethod: user.preferences?.communicationMethod || 'email'
      }));
    }
  }, [user]);

  if (!user) {
    return (
        <div className="pt-20 text-center">
            <p>Please log in to view settings.</p>
            <Button onClick={() => onNavigate('home')} className="mt-4">Go Home</Button>
        </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
        setIsSaving(false);
        onUpdateUser({
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            preferences: {
                newsletter: formData.newsletter,
                notifications: formData.notifications,
                communicationMethod: formData.communicationMethod
            }
        });
        setMessage({ type: 'success', text: 'Changes saved successfully.' });
        
        // Clear success message after 3s
        setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  return (
    <div
      className={`animate-in fade-in duration-500 pt-8 min-h-screen ${
        isRetro ? 'bg-transparent' : 'bg-gray-50/50'
      }`}
    >
       <Section>
          <div className="max-w-4xl mx-auto">
             
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
                <div>
                     <button 
                        onClick={() => onNavigate('home')}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4
                            ${isRetro ? 'text-brand-black hover:text-brand-orange' : 'text-gray-500 hover:text-black'}
                        `}
                     >
                        <ArrowLeft size={14} strokeWidth={3} /> Back to Home
                    </button>
                    <h1 className={`font-display text-4xl md:text-5xl ${isRetro ? 'text-brand-black' : 'text-gray-900'}`}>Account Settings</h1>
                </div>
                <Button variant={isRetro ? 'outline' : 'ghost'} onClick={onLogout} className="text-brand-red hover:text-brand-red hover:bg-brand-red/5">
                   <LogOut size={16} className="mr-2" /> Sign Out
                </Button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Navigation / Tabs */}
                <div className={`p-6 hidden lg:block sticky top-24
                    ${isRetro 
                        ? 'bg-white border-2 border-brand-black shadow-retro' 
                        : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                `}>
                    <nav className="space-y-1">
                        {([
                            { id: 'profile' as const, icon: UserIcon, label: 'Profile Details' },
                            { id: 'notifications' as const, icon: Bell, label: 'Notifications' },
                            { id: 'security' as const, icon: Lock, label: 'Password & Security' },
                            { id: 'preferences' as const, icon: Palette, label: 'Preferences' },
                        ]).map((item) => (
                            <button 
                                key={item.label}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors rounded-lg text-left
                                    ${activeTab === item.id 
                                        ? (isRetro ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-pop-sm' : 'bg-gray-100 text-black')
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-black'}
                                `}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Mobile Tabs */}
                    <div className={`lg:hidden p-3 border-2
                      ${isRetro ? 'bg-white border-brand-black shadow-retro' : 'bg-white border-gray-200 rounded-xl shadow-sm'}
                    `}>
                      <div className="flex gap-2 overflow-x-auto">
                        {([
                          { id: 'profile' as const, label: 'Profile' },
                          { id: 'notifications' as const, label: 'Notifications' },
                          { id: 'security' as const, label: 'Security' },
                          { id: 'preferences' as const, label: 'Preferences' },
                        ]).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors
                              ${activeTab === t.id
                                ? (isRetro ? 'bg-brand-orange text-brand-black border-2 border-brand-black shadow-pop-sm' : 'bg-gray-100 text-black rounded-lg')
                                : (isRetro ? 'text-gray-600 border-2 border-transparent hover:border-brand-black/20' : 'text-gray-600 hover:bg-gray-50 rounded-lg')}
                            `}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Feedback Message */}
                    {message && (
                        <div className={`p-4 text-sm font-bold border-l-4 animate-in slide-in-from-top-2
                            ${message.type === 'success' 
                                ? 'bg-green-50 text-green-700 border-green-500' 
                                : 'bg-red-50 text-red-700 border-red-500'}
                        `}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* 1. Public Profile */}
                        {activeTab === 'profile' && (
                        <div className={`p-6 md:p-8 mb-8 relative
                            ${isRetro 
                                ? 'bg-white border-2 border-brand-black shadow-retro' 
                                : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                        `}>
                            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-gray-100">Profile Details</h2>
                            
                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group cursor-pointer">
                                    <div className={`w-24 h-24 overflow-hidden
                                        ${isRetro ? 'border-2 border-brand-black' : 'rounded-full ring-4 ring-gray-50'}
                                    `}>
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                                        ${isRetro ? '' : 'rounded-full'}
                                    `}>
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{user.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">JPG or PNG. Max 1MB.</p>
                                    <Button size="sm" type="button" variant="outline">Upload New</Button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Full Name</label>
                                    <div className="relative">
                                        <UserIcon size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 font-medium focus:outline-none transition-all
                                                ${isRetro 
                                                ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm' 
                                                : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                            `}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-70">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 font-medium focus:outline-none transition-all
                                                    ${isRetro 
                                                    ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm' 
                                                    : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                                `}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-70">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="(555) 000-0000"
                                                className={`w-full pl-10 pr-4 py-3 font-medium focus:outline-none transition-all
                                                    ${isRetro 
                                                    ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm' 
                                                    : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                                `}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* 2. Preferences */}
                        {activeTab === 'preferences' && (
                        <div className={`p-6 md:p-8 mb-8 relative
                            ${isRetro 
                                ? 'bg-white border-2 border-brand-black shadow-retro' 
                                : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                        `}>
                            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-gray-100">Preferences</h2>
                            <div className="space-y-6">
                                
                                {/* Preferred Contact Method */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-3">Preferred Contact Method</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className={`cursor-pointer border-2 p-4 flex items-center gap-3 transition-all
                                            ${formData.communicationMethod === 'email'
                                                ? (isRetro ? 'border-brand-black bg-brand-orange/20 shadow-pop-sm' : 'border-black bg-gray-50')
                                                : (isRetro ? 'border-brand-black/20 bg-transparent' : 'border-gray-200 bg-white')}
                                            ${isRetro ? 'rounded-none' : 'rounded-lg'}
                                        `}>
                                            <input 
                                                type="radio" 
                                                name="communicationMethod" 
                                                value="email" 
                                                checked={formData.communicationMethod === 'email'}
                                                onChange={() => setFormData({...formData, communicationMethod: 'email'})}
                                                className="sr-only"
                                            />
                                            <Mail size={20} className={formData.communicationMethod === 'email' ? 'text-black' : 'text-gray-400'} />
                                            <span className="font-bold text-sm">Email</span>
                                        </label>

                                        <label className={`cursor-pointer border-2 p-4 flex items-center gap-3 transition-all
                                            ${formData.communicationMethod === 'phone'
                                                ? (isRetro ? 'border-brand-black bg-brand-orange/20 shadow-pop-sm' : 'border-black bg-gray-50')
                                                : (isRetro ? 'border-brand-black/20 bg-transparent' : 'border-gray-200 bg-white')}
                                            ${isRetro ? 'rounded-none' : 'rounded-lg'}
                                        `}>
                                            <input 
                                                type="radio" 
                                                name="communicationMethod" 
                                                value="phone" 
                                                checked={formData.communicationMethod === 'phone'}
                                                onChange={() => setFormData({...formData, communicationMethod: 'phone'})}
                                                className="sr-only"
                                            />
                                            <Smartphone size={20} className={formData.communicationMethod === 'phone' ? 'text-black' : 'text-gray-400'} />
                                            <span className="font-bold text-sm">SMS / Text</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* 3. Notifications */}
                        {activeTab === 'notifications' && (
                        <div className={`p-6 md:p-8 mb-8 relative
                            ${isRetro 
                                ? 'bg-white border-2 border-brand-black shadow-retro' 
                                : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                        `}>
                            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-gray-100">Notifications</h2>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div>
                                        <div className="font-bold text-sm mb-1 group-hover:text-brand-orange transition-colors">Marketing Newsletter</div>
                                        <div className="text-xs text-gray-500">Receive updates about new arrivals and events.</div>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleChange}
                                            className="sr-only peer" 
                                        />
                                        <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-orange transition-all
                                            ${isRetro 
                                                ? 'bg-gray-200 peer-checked:bg-brand-black border-2 border-brand-black' 
                                                : 'bg-gray-200 peer-checked:bg-black'}
                                        `}></div>
                                        <div className={`absolute top-1 left-1 bg-white border border-gray-300 rounded-full h-4 w-4 transition-all peer-checked:translate-x-full
                                            ${isRetro ? 'border-brand-black' : ''}
                                        `}></div>
                                    </div>
                                </label>
                                
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div>
                                        <div className="font-bold text-sm mb-1 group-hover:text-brand-orange transition-colors">Order Notifications</div>
                                        <div className="text-xs text-gray-500">Receive updates about your order status via your preferred method.</div>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="notifications"
                                            checked={formData.notifications}
                                            onChange={handleChange}
                                            className="sr-only peer" 
                                        />
                                        <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-orange transition-all
                                            ${isRetro 
                                                ? 'bg-gray-200 peer-checked:bg-brand-black border-2 border-brand-black' 
                                                : 'bg-gray-200 peer-checked:bg-black'}
                                        `}></div>
                                        <div className={`absolute top-1 left-1 bg-white border border-gray-300 rounded-full h-4 w-4 transition-all peer-checked:translate-x-full
                                            ${isRetro ? 'border-brand-black' : ''}
                                        `}></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        )}

                        {/* 4. Security */}
                        {activeTab === 'security' && (
                        <div className={`p-6 md:p-8 mb-8 relative
                            ${isRetro 
                                ? 'bg-white border-2 border-brand-black shadow-retro' 
                                : 'bg-white border border-gray-200 rounded-xl shadow-sm'}
                        `}>
                            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-gray-100">Password & Security</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">Current Password</label>
                                    <div className="relative">
                                        <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                                        <input 
                                            type="password" 
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                            className={`w-full pl-10 pr-4 py-3 font-medium focus:outline-none transition-all
                                                ${isRetro 
                                                ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm' 
                                                : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                            `}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">New Password</label>
                                    <div className="relative">
                                        <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isRetro ? 'text-brand-black' : 'text-gray-400'}`} />
                                        <input 
                                            type="password" 
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Leave blank to keep current"
                                            className={`w-full pl-10 pr-4 py-3 font-medium focus:outline-none transition-all
                                                ${isRetro 
                                                ? 'bg-brand-cream border-2 border-brand-black focus:shadow-pop-sm' 
                                                : 'bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black focus:ring-1 focus:ring-black'}
                                            `}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Save Button */}
                        <div className="sticky bottom-6 z-10 flex justify-end">
                            <Button 
                                type="submit" 
                                size="lg" 
                                disabled={isSaving}
                                className={isRetro ? 'shadow-pop hover:shadow-pop-hover' : 'shadow-lg'}
                            >
                                {isSaving ? 'Saving...' : (
                                    <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Danger Zone */}
                    {activeTab === 'security' && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-red-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Shield size={16} /> Danger Zone
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button variant={isRetro ? 'outline' : 'ghost'} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                            Delete Account
                        </Button>
                    </div>
                    )}

                </div>
             </div>

          </div>
       </Section>
    </div>
  );
};
