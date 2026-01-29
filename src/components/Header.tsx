
import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, Search, ChevronDown, User as UserIcon, LogOut, Package, Settings } from 'lucide-react';
import { ViewMode, User, Page, Product } from '../../types';
import { ProductCategory, RecordFormat } from '../types/productEnums';

interface HeaderProps {
  viewMode: ViewMode;
  onCartClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onViewOrders?: () => void;
  onAccountSettings?: () => void;
  onNavigate: (page: Page, filter?: string) => void;
  onProductClick?: (product: Product) => void;
  cartCount?: number;
  products?: Product[];
  currentPage?: Page;
  currentFilter?: string;
}

interface NavColumn {
  title: string;
  links: { label: string; page?: Page; filter?: string }[];
}

interface NavItem {
  label: string;
  page?: Page;
  filter?: string;
  hasDropdown?: boolean;
  highlight?: boolean;
  columns?: NavColumn[];
  simpleDropdown?: { label: string; page?: Page; filter?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'New Releases', page: 'catalog', filter: 'New Arrivals' },
  { 
    label: 'Shop', 
    page: 'catalog', 
    filter: 'All',
    hasDropdown: true,
    columns: [
      {
        title: 'Vinyl & Media',
        links: [
            { label: 'New Vinyl (33s)', page: 'catalog', filter: 'New Vinyl' }, 
            { label: 'Used Vinyl (33s)', page: 'catalog', filter: 'Used Vinyl' }, 
            { label: '45s / 7"', page: 'catalog', filter: RecordFormat.SEVEN_INCH }, 
            { label: 'CDs', page: 'catalog', filter: RecordFormat.CD }, 
            { label: 'Cassettes', page: 'catalog', filter: RecordFormat.CASSETTE }, 
            { label: 'Box Sets', page: 'catalog', filter: 'Box Set' },
            { label: 'Record Store Day', page: 'catalog', filter: 'Record Store Day' },
            { label: 'Compilations', page: 'catalog', filter: 'Compilations' }
        ]
      },
      {
        title: 'By Genre',
        links: [
          ProductCategory.ROCK,
          ProductCategory.JAZZ,
          ProductCategory.RAP_HIP_HOP,
          ProductCategory.FUNK_SOUL,
          ProductCategory.INDIE,
          ProductCategory.METAL,
          ProductCategory.PUNK_SKA,
          ProductCategory.REGGAE,
          ProductCategory.COUNTRY,
          ProductCategory.ELECTRONIC,
          ProductCategory.BLUES,
          ProductCategory.FOLK,
          ProductCategory.POP,
          ProductCategory.SOUNDTRACKS,
        ]
          .map(
            (genre): { label: string; page: 'catalog'; filter: string } => ({
              label: genre,
              page: 'catalog',
              filter: genre,
            }),
          )
          .concat([{ label: 'Browse all genres', page: 'catalog', filter: 'All' }]),
      },
      {
        title: 'Equipment',
        links: [
            { label: 'Turntables & Audio', page: 'catalog', filter: 'Equipment' }, 
            { label: 'Cleaning Kits', page: 'catalog', filter: 'Cleaner' }, 
            { label: 'Sleeves & Protection', page: 'catalog', filter: 'Sleeves' }, 
            { label: 'Slip Mats', page: 'catalog', filter: 'Slip Mat' }, 
            { label: 'Crates & Storage', page: 'catalog', filter: 'Crates' }, 
            { label: 'Adapters', page: 'catalog', filter: 'Adapters' },
            { label: 'Boomboxes', page: 'catalog', filter: 'Boombox' }
        ]
      },
      {
        title: 'Merch & Lifestyle',
        links: [
            { label: 'Apparel (T-Shirts, Hats)', page: 'catalog', filter: 'Apparel' }, 
            { label: 'Home (Candles, Mugs)', page: 'catalog', filter: 'Home' }, 
            { label: 'Posters & Art', page: 'catalog', filter: 'Poster' }, 
            { label: 'Collectibles (Funko, Toys)', page: 'catalog', filter: 'Collectibles' }, 
            { label: 'Pins, Patches & Stickers', page: 'catalog', filter: 'Sticker' }, 
            { label: 'Books', page: 'catalog', filter: 'Book' },
            { label: 'Tote Bags', page: 'catalog', filter: 'Tote Bag' }
        ]
      }
    ]
  },
  { label: 'Events', page: 'events' },
  { label: 'Locations', page: 'locations' },
  {
    label: 'About',
    page: 'about',
    hasDropdown: true,
    simpleDropdown: [
        { label: 'Our Story', page: 'about' }, 
        { label: 'We Buy Records', page: 'we-buy' }
    ]
  },
  { 
    label: 'Help', 
    hasDropdown: true,
    simpleDropdown: [
        { label: 'Pickup & Returns', page: 'locations' }, 
        { label: 'Contact Us', page: 'contact' }
    ]
  }
];

export const Header: React.FC<HeaderProps> = ({ 
  viewMode, 
  onCartClick, 
  user, 
  onLoginClick, 
  onLogoutClick,
  onViewOrders,
  onAccountSettings,
  onNavigate,
  onProductClick,
  cartCount = 0,
  products = [],
  currentPage,
  currentFilter
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep a CSS var in sync with the fixed header height so page content
  // can offset correctly (prevents Hero/content sitting under header).
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--app-header-height', `${h}px`);
    };

    update();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
        setTimeout(() => mobileSearchRef.current?.focus(), 100);
    }
  }, [isMobileSearchOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMobileGroup = (label: string) => {
    setMobileExpanded(prev => prev === label ? null : label);
  };

  const handleUserIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onLoginClick();
    } else {
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };

  const handleNavClick = (e: React.MouseEvent, page?: Page, filter?: string) => {
    e.preventDefault();
    if (page) {
        onNavigate(page, filter);
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
        window.scrollTo(0, 0);
    }
  };

  const hrefFor = (page?: Page, filter?: string) => {
    if (!page) return '#';
    if (page === 'home') return '/';
    if (page === 'catalog') {
      const f = (filter || '').trim();
      return f && f !== 'All' ? `/catalog/${encodeURIComponent(f)}` : '/catalog';
    }
    if (page === 'search') return '/search';
    if (page === 'order-status') return '/order-status';
    return `/${page}`;
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const lowerQuery = query.toLowerCase();
      const filtered = products.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) || 
        p.artist.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      setSearchResults(filtered);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        onNavigate('search', searchQuery);
        setShowSearchDropdown(false);
        setIsMobileMenuOpen(false);
        setSearchQuery(''); // Optional: clear search after submit
        window.scrollTo(0, 0);
    }
  };

  const isRetro = viewMode === 'retro';

  return (
    <>
      {/* Sticky Header - Follows page as we scroll */}
      <div
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[120] w-full transition-all duration-300
          ${isRetro ? 'bg-black' : 'bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90'}
          ${scrolled 
              ? (isRetro ? 'border-b-2 border-brand-black shadow-retro-sm' : 'shadow-md border-b border-gray-100') 
              : ''}
      `}
      >
        
        {/* 1. Announcement Bar */}
        <div className="w-full py-2.5 bg-brand-black text-white text-center text-[11px] font-bold uppercase tracking-[0.15em] relative z-[60]">
          <span className="text-brand-orange neon-text-orange">Order Online, Pick Up In-Store</span> <span className="mx-2 opacity-30">|</span> <span className="text-brand-red cursor-pointer hover:underline hover:neon-text-pink transition-all duration-300" onClick={() => onNavigate('we-buy')}>We Buy Used Vinyl</span>
        </div>

        {/* 2. Main Header Container */}
        <div className={`w-full transition-all duration-300
            ${!scrolled ? 'border-b' : ''}
            ${isRetro ? 'border-white/10' : 'border-gray-100'}
        `}>
          <div className={`max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 transition-all duration-300
              ${scrolled ? 'py-2.5' : 'py-3 md:py-5'}
          `}>
            <div className="flex items-center justify-between gap-4 md:gap-6">
              
              {/* Mobile Menu Toggle */}
              <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} className={isRetro ? 'text-white' : 'text-black'} />
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 cursor-pointer group flex-1 md:flex-none text-center md:text-left" onClick={() => onNavigate('home')}>
                <div className="flex items-center justify-center md:justify-start">
                  
                  <div className={`flex flex-col leading-none items-center md:items-start transition-all origin-left
                    ${scrolled ? 'scale-100' : 'scale-100'}
                  `}>
                    <div className="inline-block origin-center animate-spin-slow motion-reduce:animate-none transition-all duration-300">
                      <img 
                        src="/full-logo.png" 
                        alt="Spiral Groove Records" 
                        className="h-32 sm:h-36 md:h-40 w-auto transform group-hover:scale-[1.02] transition-transform object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Bar (Desktop) */}
              <div className="hidden md:flex flex-1 max-w-lg mx-auto px-6" ref={searchContainerRef}>
                    <form className="w-full relative group" onSubmit={handleSearchSubmit}>
                      <input 
                        type="text" 
                        placeholder="Search artist, title, or genre..." 
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onFocus={() => {
                            if (searchQuery.trim().length > 0) {
                                setShowSearchDropdown(true);
                            }
                        }}
                        className={`w-full pl-5 pr-12 text-sm font-medium transition-all focus:outline-none
                          ${scrolled ? 'h-10' : 'h-12'}
                          ${isRetro 
                            ? 'bg-white text-brand-black placeholder-brand-black/40 shadow-pop-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]' 
                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-full'}
                        `}
                        style={isRetro ? { 
                          border: '2px solid #000000',
                          boxShadow: '0 0 0 2px #00C2CB, 0 0 10px rgba(0, 194, 203, 0.5), 0 0 20px rgba(0, 194, 203, 0.3)'
                        } : undefined}
                      />
                      <button 
                         type="submit"
                         className={`absolute right-1 top-1 w-10 flex items-center justify-center transition-colors
                         ${scrolled ? 'h-8' : 'h-10'}
                         ${isRetro 
                           ? 'text-[#00C2CB] hover:text-[#00E5F0] hover:drop-shadow-[0_0_8px_rgba(0,194,203,0.8)]' 
                           : 'text-gray-400 hover:text-brand-black rounded-full'}
                      `}>
                        <Search size={scrolled ? 18 : 20} strokeWidth={2.5} />
                      </button>

                      {/* Desktop Search Dropdown */}
                      {showSearchDropdown && searchResults.length > 0 && (
                        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-[130]
                            ${isRetro ? 'bg-white border-2 border-brand-black shadow-retro' : 'bg-white border border-gray-200 shadow-xl'}
                        `}>
                            <ul className="max-h-[300px] overflow-y-auto">
                                {searchResults.map(product => (
                                    <li key={product.id}>
                                        <button
                                            onClick={() => {
                                                if (onProductClick) {
                                                    onProductClick(product);
                                                } else {
                                                    // Fallback if no handler provided
                                                    onNavigate('product');
                                                    window.history.pushState(null, '', `/product/${encodeURIComponent(product.id)}`);
                                                }
                                                setShowSearchDropdown(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                                        >
                                            <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                                <img src={product.coverUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate text-gray-900">{product.title}</div>
                                                <div className="text-xs text-gray-500 truncate">{product.artist}</div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleSearchSubmit}
                                className={`w-full py-3 text-center text-xs font-bold uppercase tracking-wider border-t transition-colors
                                    ${isRetro ? 'bg-brand-mustard text-brand-black hover:bg-brand-orange border-brand-black' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100'}
                                `}
                            >
                                View all results for "{searchQuery}"
                            </button>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">

                     {/* Mobile Search Toggle - HIDDEN since it's in the drawer now */}
                     {/* 
                     <button 
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className={`md:hidden p-2
                            ${isRetro ? 'text-brand-black' : 'text-black'}
                        `}
                     >
                        <Search size={24} />
                     </button>
                     */}

                     {/* Account Button */}
                     <div 
                        className="user-menu-container flex items-center justify-center w-10 h-10 cursor-pointer relative"
                        onClick={handleUserIconClick}
                     >
                        {user ? (
                           <>
                             <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 overflow-hidden transition-all
                                ${isRetro ? 'border-brand-black shadow-pop-sm hover:border-[#00C2CB] hover:neon-glow-orange' : 'border-gray-200 shadow-sm hover:shadow-neon-orange'}
                             `}>
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                             </div>
                             
                             {/* User Dropdown */}
                             <div className={`absolute top-full right-0 pt-3 transition-all duration-200 origin-top-right z-[200]
                                ${isUserMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                             `}>
                                <div className={`w-56 p-2 rounded-xl shadow-2xl border flex flex-col gap-1 overflow-hidden
                                   ${isRetro ? 'bg-white border-brand-black shadow-retro-sm' : 'bg-white border-gray-100'}
                                `}>
                                   <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Signed in as</div>
                                      <div className={`font-bold truncate ${isRetro ? 'font-header' : 'font-sans'}`}>{user.name}</div>
                                   </div>
                                   
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(false); onViewOrders?.(); }}
                                      className="text-left px-4 py-2.5 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors font-medium text-gray-700"
                                   >
                                      <Package size={16} className="text-gray-400" />
                                      Orders
                                   </button>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(false); onAccountSettings?.(); }}
                                      className="text-left px-4 py-2.5 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors font-medium text-gray-700"
                                   >
                                      <Settings size={16} className="text-gray-400" />
                                      Account Settings
                                   </button>
                                   
                                   <div className="h-px bg-gray-100 my-1"></div>
                                   
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(false); onLogoutClick(); }}
                                      className="text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-3 transition-colors font-bold"
                                   >
                                      <LogOut size={16} /> Sign Out
                                   </button>
                                </div>
                             </div>
                           </>
                        ) : (
                           <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-colors
                              ${isRetro ? 'border-white/20 hover:bg-white/10 hover:border-[#00C2CB]' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}
                           `}>
                             <UserIcon size={20} className={`transition-colors ${isRetro ? 'text-white hover:text-[#00C2CB]' : 'text-current'}`} />
                           </div>
                        )}
                     </div>

                     <button onClick={onCartClick} className="flex items-center gap-3 group cursor-pointer relative md:mr-0">
                        <div className="relative p-2">
                           <ShoppingCart size={24} strokeWidth={2} className={`transition-all group-hover:scale-110 ${isRetro ? 'text-white group-hover:text-[#00C2CB] group-hover:drop-shadow-[0_0_10px_rgba(0,194,203,0.8)]' : 'text-black group-hover:text-brand-orange'} `} />
                           {cartCount > 0 && (
                             <span className={`absolute top-0 right-0 h-4 w-4 flex items-center justify-center text-[9px] font-bold rounded-full text-white border border-white
                                ${isRetro ? 'bg-brand-orange' : 'bg-brand-red'}
                             `}>
                                {cartCount}
                             </span>
                           )}
                        </div>
                     </button>
                  </div>
                </div>

                {/* Mobile Search Bar (Expandable) - REMOVED since it's in drawer */}
                {/* 
                {isMobileSearchOpen && (
                    <div className="md:hidden mt-4 pb-2 animate-in slide-in-from-top-2 duration-200">
                        ...
                    </div>
                )}
                */}
              </div>
            </div>

          {/* 3. Navigation Bar (Desktop) */}
          <div className={`hidden md:block w-full border-b relative z-[120] transition-all duration-300
             ${isRetro ? 'border-brand-black/10' : 'border-gray-100'}
             ${scrolled ? 'border-none' : ''}
          `}>
             <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                <nav className={`flex items-center justify-center transition-all duration-300 ${scrolled ? 'h-10' : 'h-14'}`}>
                   <ul className="flex items-center gap-8 h-full">
                        {NAV_ITEMS.map((item) => {
                          // For catalog page, check both page and filter to determine active state
                          let isActive = false;
                          if (currentPage && item.page === currentPage) {
                            if (item.page === 'catalog') {
                              // For catalog items, check if the filter matches
                              if (item.filter === 'New Arrivals') {
                                // "New Releases" is only active when filter is "New Arrivals"
                                isActive = currentFilter === 'New Arrivals';
                              } else if (item.filter === 'All') {
                                // "Shop" is active for any catalog filter except "New Arrivals"
                                isActive = currentFilter !== 'New Arrivals' && currentFilter !== undefined;
                              } else {
                                // Other catalog items match by filter
                                isActive = currentFilter === item.filter;
                              }
                            } else {
                              // For non-catalog pages, just check the page
                              isActive = true;
                            }
                          }
                          return (
                          <li 
                            key={item.label} 
                            className="h-full flex items-center"
                            onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                          >
                             <a 
                               href={hrefFor(item.page, item.filter)}
                               onClick={(e) => handleNavClick(e, item.page, item.filter)}
                               className={`flex items-center gap-1 h-full text-[13px] font-bold uppercase tracking-widest border-b-[3px] transition-all px-1
                                  ${isActive 
                                    ? (isRetro ? 'border-brand-orange text-brand-orange neon-text-orange' : 'border-brand-orange text-brand-orange')
                                    : 'border-transparent'
                                  }
                                  ${item.highlight && !isActive ? 'text-brand-red' : ''}
                                  ${!isActive && !item.highlight ? (isRetro ? 'text-white hover:text-brand-orange hover:neon-text-orange' : 'text-gray-600 hover:text-brand-orange hover:border-brand-orange/50') : ''}
                                  ${activeDropdown === item.label && !isActive ? (isRetro ? 'border-brand-orange text-brand-orange neon-text-orange' : 'border-brand-orange text-brand-orange') : ''}
                               `}
                             >
                                {item.label}
                                {item.hasDropdown && <ChevronDown size={14} strokeWidth={3} className="opacity-50" />}
                             </a>

                             {item.hasDropdown && activeDropdown === item.label && (
                               <div className={`absolute left-0 top-full w-full border-b bg-white animate-in fade-in duration-200 z-[130]
                                  ${isRetro ? 'border-t-2 border-brand-black shadow-retro' : 'border-t border-gray-100 shadow-xl'}
                               `}>
                                  <div className="max-w-[1400px] mx-auto px-8 py-10">
                                     {item.columns ? (
                                       <div className="grid grid-cols-4 gap-12">
                                          {item.columns.map((col, idx) => (
                                             <div key={idx}>
                                                <h4 className={`font-bold uppercase tracking-widest text-xs mb-5 pb-2 border-b
                                                   ${isRetro ? 'text-brand-black border-brand-black font-header' : 'text-gray-900 border-gray-200 font-sans'}
                                                `}>
                                                   {col.title}
                                                </h4>
                                                <ul className="space-y-3">
                                                   {col.links.map((link) => (
                                                      <li key={link.label}>
                                                         <a 
                                                            href={hrefFor(link.page, link.filter)} 
                                                            onClick={(e) => handleNavClick(e, link.page, link.filter)}
                                                            className={`text-sm block transition-colors
                                                                ${isRetro 
                                                                ? 'text-gray-600 hover:text-brand-orange hover:translate-x-1 transition-transform' 
                                                                : 'text-gray-500 hover:text-brand-red hover:underline'}
                                                            `}
                                                         >
                                                            {link.label}
                                                         </a>
                                                      </li>
                                                   ))}
                                                </ul>
                                             </div>
                                          ))}
                                          <div 
                                            className="bg-brand-cream p-8 flex flex-col items-center justify-center text-center group cursor-pointer border-2 border-transparent hover:border-brand-orange transition-colors"
                                            onClick={() => onNavigate('catalog', 'New Arrivals')}
                                          >
                                             <div className="w-20 h-20 bg-brand-black rounded-full mb-4 flex items-center justify-center border-2 border-brand-black shadow-pop-sm group-hover:scale-110 transition-transform">
                                                <div className="w-6 h-6 bg-brand-orange rounded-full animate-pulse shadow-[0_0_12px_#00C2CB]"></div>
                                             </div>
                                             <h5 className="font-bold text-xl mb-2 font-display">New Arrivals</h5>
                                             <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-2 mb-1
                                               ${isRetro 
                                                 ? 'bg-brand-mustard text-brand-black border-brand-black shadow-pop-sm' 
                                                 : 'bg-white text-gray-700 border-gray-200 shadow-sm rounded-full'}
                                             `}>
                                               Every Friday
                                             </div>
                                          </div>
                                       </div>
                                     ) : (
                                       <div className="w-56">
                                           <ul className="space-y-3">
                                              {item.simpleDropdown?.map((link) => (
                                                 <li key={link.label}>
                                                    <a 
                                                        href={hrefFor(link.page, link.filter)} 
                                                        onClick={(e) => handleNavClick(e, link.page, link.filter)}
                                                        className="block text-sm text-gray-600 hover:text-brand-orange font-bold"
                                                    >
                                                       {link.label}
                                                    </a>
                                                 </li>
                                              ))}
                                           </ul>
                                       </div>
                                     )}
                                  </div>
                               </div>
                             )}
                          </li>
                          );
                        })}
                   </ul>
                </nav>
             </div>
          </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[900] md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Menu Drawer */}
          <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[360px] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 border-r
             ${isRetro 
               ? 'bg-brand-cream border-brand-black border-r-2' 
               : 'bg-white border-gray-200'
             }
          `}>
             
             {/* Header */}
             <div className={`flex items-center justify-between p-6 border-b
                ${isRetro ? 'border-brand-black/10' : 'border-gray-100'}
             `}>
                <span className={`font-display text-2xl ${isRetro ? 'text-brand-black' : 'text-black'}`}>MENU</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-full transition-colors
                    ${isRetro ? 'hover:bg-black/5 text-brand-black' : 'hover:bg-gray-100 text-black'}
                  `}
                >
                  <X size={24} />
                </button>
             </div>

             {/* Search in Drawer */}
             <div className="px-6 pt-6 pb-2">
                <form className="relative group" onSubmit={handleSearchSubmit}>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={handleSearchInput}
                        className={`w-full pl-4 pr-10 h-10 text-sm font-medium transition-all focus:outline-none
                            ${isRetro 
                            ? 'bg-white border-2 border-brand-black text-brand-black placeholder-brand-black/40 shadow-pop-sm focus:border-brand-orange' 
                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg'}
                        `}
                    />
                    <button 
                        type="submit"
                        className={`absolute right-1 top-1 w-8 h-8 flex items-center justify-center transition-colors
                        ${isRetro 
                            ? 'text-brand-black hover:text-brand-orange' 
                            : 'text-gray-400 hover:text-black'}
                    `}>
                        <Search size={18} strokeWidth={2.5} />
                    </button>

                    {/* Mobile Search Dropdown */}
                    {showSearchDropdown && searchResults.length > 0 && (
                        <div className={`mt-2 rounded-xl overflow-hidden z-[130]
                            ${isRetro ? 'bg-white border-2 border-brand-black shadow-none' : 'bg-white border border-gray-200 shadow-lg'}
                        `}>
                            <ul className="max-h-[200px] overflow-y-auto">
                                {searchResults.map(product => (
                                    <li key={product.id}>
                                        <button
                                            onClick={() => {
                                                // Same logic as desktop
                                                if (onProductClick) {
                                                    onProductClick(product);
                                                } else {
                                                    window.history.pushState(null, '', `/product/${encodeURIComponent(product.id)}`);
                                                }
                                                setShowSearchDropdown(false);
                                                setIsMobileMenuOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                                        >
                                            <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                                <img src={product.coverUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-xs truncate text-gray-900">{product.title}</div>
                                                <div className="text-[10px] text-gray-500 truncate">{product.artist}</div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleSearchSubmit}
                                className={`w-full py-3 text-center text-xs font-bold uppercase tracking-wider border-t transition-colors
                                    ${isRetro ? 'bg-brand-mustard text-brand-black hover:bg-brand-orange border-brand-black' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100'}
                                `}
                            >
                                View all results
                            </button>
                        </div>
                    )}
                </form>
             </div>

             {/* Links */}
             <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <ul className="space-y-6">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.label}>
                      {item.hasDropdown ? (
                        <div>
                          <button 
                            onClick={() => toggleMobileGroup(item.label)}
                            className={`flex items-center justify-between w-full text-left font-bold text-lg uppercase tracking-wide
                               ${isRetro ? 'text-brand-black' : 'text-gray-900'}
                            `}
                          >
                            {item.label}
                            <ChevronDown 
                              size={20} 
                              className={`transition-transform duration-300 ${mobileExpanded === item.label ? 'rotate-180' : ''}`}
                            />
                          </button>
                          
                          {/* Expanded Content */}
                          {mobileExpanded === item.label && (
                            <div className={`mt-4 pl-4 space-y-6 border-l-2 animate-in slide-in-from-top-2 duration-200
                               ${isRetro ? 'border-brand-black/10' : 'border-gray-100'}
                            `}>
                               {item.columns ? (
                                  item.columns.map((col, idx) => (
                                    <div key={idx} className="mb-4 last:mb-0">
                                      <h5 className={`text-xs font-bold uppercase mb-3
                                         ${isRetro ? 'text-brand-orange' : 'text-black'}
                                      `}>{col.title}</h5>
                                      <ul className="space-y-3">
                                        {col.links.map(link => (
                                          <li key={link.label}>
                                            <a 
                                                href={hrefFor(link.page, link.filter)} 
                                                onClick={(e) => handleNavClick(e, link.page, link.filter)}
                                                className={`block text-sm font-medium transition-colors
                                                    ${isRetro 
                                                        ? 'text-gray-600 active:text-brand-black' 
                                                        : 'text-gray-500 active:text-black'}
                                                `}
                                            >
                                                {link.label}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))
                               ) : (
                                  <ul className="space-y-3">
                                     {item.simpleDropdown?.map(link => (
                                       <li key={link.label}>
                                            <a 
                                                href={hrefFor(link.page, link.filter)} 
                                                onClick={(e) => handleNavClick(e, link.page, link.filter)}
                                                className={`block text-sm font-medium transition-colors
                                                ${isRetro 
                                                    ? 'text-gray-600 active:text-brand-black' 
                                                    : 'text-gray-500 active:text-black'}
                                                `}
                                            >
                                                {link.label}
                                            </a>
                                       </li>
                                     ))}
                                  </ul>
                               )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <a 
                            href={hrefFor(item.page, item.filter)} 
                            onClick={(e) => handleNavClick(e, item.page, item.filter)}
                            className={`block font-bold text-lg uppercase tracking-wide 
                            ${(() => {
                              // For catalog page, check both page and filter to determine active state
                              if (currentPage && item.page === currentPage) {
                                if (item.page === 'catalog') {
                                  // For catalog items, check if the filter matches
                                  if (item.filter === 'New Arrivals') {
                                    // "New Releases" is only active when filter is "New Arrivals"
                                    return currentFilter === 'New Arrivals';
                                  } else if (item.filter === 'All') {
                                    // "Shop" is active for any catalog filter except "New Arrivals"
                                    return currentFilter !== 'New Arrivals' && currentFilter !== undefined;
                                  } else {
                                    // Other catalog items match by filter
                                    return currentFilter === item.filter;
                                  }
                                } else {
                                  // For non-catalog pages, just check the page
                                  return true;
                                }
                              }
                              return false;
                            })()
                                ? (isRetro ? 'text-brand-orange' : 'text-brand-orange')
                                : item.highlight 
                                    ? 'text-brand-red' 
                                    : (isRetro ? 'text-brand-black' : 'text-gray-900')
                            }
                            `}
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
