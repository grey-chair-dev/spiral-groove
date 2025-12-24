
import React, { useState, useEffect } from 'react';
import { trackPageView, trackProductView, trackAddToCart, trackRemoveFromCart, trackBeginCheckout, trackPurchase, trackSearch, trackNewsletterSignup, trackSignup, trackLogin } from './utils/analytics';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { StaffPicks } from './components/StaffPicks';
import { StorySection } from './components/StorySection';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { ProductModal } from './components/ProductModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/ui/Toast';
import { EventsPage } from './components/EventsPage';
import { AboutPage } from './components/AboutPage';
import { LocationsPage } from './components/LocationsPage';
import { SalesPage } from './components/SalesPage';
import { WeBuyPage } from './components/WeBuyPage';
import { CatalogPage } from './components/CatalogPage';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { OrdersPage } from './components/OrdersPage';
import { ReceiptPage } from './components/ReceiptPage';
import { OrderStatusPage } from './components/OrderStatusPage';
import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';
import { StaffPicksPage } from './components/StaffPicksPage';
import { RSVPPage } from './components/RSVPPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { SettingsPage } from './components/SettingsPage';
import { SearchPage } from './components/SearchPage';
import { ClientLoginPage } from './components/ClientLoginPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { AccessibilityPage } from './components/AccessibilityPage';
import { PRODUCTS, STAFF_PICKS, EVENTS } from '../constants';
import { Product, ViewMode, User, Page, Order, Event, CartItem } from '../types';
import { fetchProducts as fetchApiProducts, Product as ApiProduct } from './dataAdapter';
import { getDefaultProductImage } from './utils/defaultProductImage';

const VALID_PAGES: Page[] = [
  'home',
  'events',
  'about',
  'locations',
  'sales',
  'we-buy',
  'catalog',
  'product',
  'orders',
  'receipt',
  'order-status',
  'faq',
  'contact',
  'staff-picks',
  'rsvp',
  'cart',
  'checkout',
  'order-confirmation',
  'settings',
  'search',
  'privacy',
  'terms',
  'accessibility',
];

function parseRouteFromLocation(input: {
  pathname: string;
  search: string;
  hash: string;
}): {
  page: Page;
  filter?: string;
  searchQuery?: string;
  orderStatusParams?: { id: string; email: string };
  productId?: string;
} {
  // Back-compat: if an old hash route is present, parse it first.
  // Example: #catalog/New%20Arrivals, #product/123, #order-status/ABC/email%40x.com
  const hashRaw = (input.hash || '').startsWith('#') ? input.hash.slice(1) : input.hash || '';
  if (hashRaw) {
    const [pageRaw, ...rest] = hashRaw.split('/');
    const page = pageRaw as Page;
    const pageParam = rest.join('/');
    if (VALID_PAGES.includes(page)) {
      if (page === 'catalog') return { page, filter: pageParam ? decodeURIComponent(pageParam) : undefined };
      if (page === 'search') return { page, searchQuery: pageParam ? decodeURIComponent(pageParam) : '' };
      if (page === 'order-status' && rest.length >= 2) {
        const [id, email] = rest;
        return { page, orderStatusParams: { id, email: decodeURIComponent(email) } };
      }
      if (page === 'product' && pageParam) return { page, productId: decodeURIComponent(pageParam) };
      return { page };
    }
  }

  const pathname = (input.pathname || '/').replace(/\/+$/, '') || '/';
  const parts = pathname.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(input.search || '');

  if (parts.length === 0) return { page: 'home' };

  const [first, second, third] = parts;
  switch (first) {
    case 'events':
      return { page: 'events' };
    case 'about':
      return { page: 'about' };
    case 'locations':
      return { page: 'locations' };
    case 'sales':
      return { page: 'sales' };
    case 'we-buy':
      return { page: 'we-buy' };
    case 'catalog': {
      const filter =
        (second ? decodeURIComponent(second) : undefined) ??
        (searchParams.get('filter') ? decodeURIComponent(searchParams.get('filter') as string) : undefined);
      return { page: 'catalog', filter: filter || undefined };
    }
    case 'search': {
      const q =
        (second ? decodeURIComponent(second) : undefined) ??
        (searchParams.get('q') ? decodeURIComponent(searchParams.get('q') as string) : '');
      return { page: 'search', searchQuery: q || '' };
    }
    case 'product': {
      if (!second) return { page: 'catalog' };
      return { page: 'product', productId: decodeURIComponent(second) };
    }
    case 'orders':
      return { page: 'orders' };
    case 'order-status': {
      const id = second ? decodeURIComponent(second) : '';
      const email = third ? decodeURIComponent(third) : '';
      return { page: 'order-status', orderStatusParams: { id, email } };
    }
    case 'faq':
      return { page: 'faq' };
    case 'contact':
      return { page: 'contact' };
    case 'staff-picks':
      return { page: 'staff-picks' };
    case 'cart':
      return { page: 'cart' };
    case 'checkout':
      return { page: 'checkout' };
    case 'order-confirmation':
      return { page: 'order-confirmation' };
    case 'settings':
      return { page: 'settings' };
    case 'privacy':
      return { page: 'privacy' };
    case 'terms':
      return { page: 'terms' };
    case 'accessibility':
      return { page: 'accessibility' };
    default:
      return { page: 'home' };
  }
}

function toPathFromState(args: {
  page: Page;
  selectedProductId?: string | null;
  filter?: string;
  searchQuery?: string;
  orderStatusParams?: { id: string; email: string };
}): string {
  const { page } = args;
  switch (page) {
    case 'home':
      return '/';
    case 'catalog': {
      const f = (args.filter || '').trim();
      return f && f !== 'All' ? `/catalog/${encodeURIComponent(f)}` : '/catalog';
    }
    case 'search': {
      const q = (args.searchQuery || '').trim();
      return q ? `/search/${encodeURIComponent(q)}` : '/search';
    }
    case 'product': {
      const id = args.selectedProductId ? encodeURIComponent(args.selectedProductId) : '';
      return id ? `/product/${id}` : '/catalog';
    }
    case 'order-status': {
      const id = args.orderStatusParams?.id ? encodeURIComponent(args.orderStatusParams.id) : '';
      const email = args.orderStatusParams?.email ? encodeURIComponent(args.orderStatusParams.email) : '';
      return id && email ? `/order-status/${id}/${email}` : '/order-status';
    }
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'accessibility':
      return '/accessibility';
    default:
      return `/${page}`;
  }
}

function App() {
  const requireClientLogin =
    (import.meta.env.VITE_REQUIRE_CLIENT_LOGIN ?? 'false').toString().toLowerCase() === 'true';

  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior });
    } catch {
      // ignore
    }
  };

  const initialRoute = parseRouteFromLocation({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('retro');
  // "Modern mode" has been removed. We keep the toggle state for UI copy,
  // but force the styling to always use the Electric (retro) theme.
  const effectiveViewMode: ViewMode = 'retro';
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [currentFilter, setCurrentFilter] = useState<string | undefined>(initialRoute.filter);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.searchQuery ?? '');

  const [clientAuthed, setClientAuthed] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('greychair_client_auth') === 'true' ||
        sessionStorage.getItem('greychair_client_auth') === 'true'
      );
    } catch {
      return false;
    }
  });
  
  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // Cart & Toast State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Last Order State for Confirmation Page
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [orderStatusParams, setOrderStatusParams] = useState<{ id: string; email: string }>(
    initialRoute.orderStatusParams ?? { id: '', email: '' }
  );
  const [pendingProductId, setPendingProductId] = useState<string | null>(initialRoute.productId ?? null);

  const parseArtistAndTitle = (cleanName: string): { artist: string; title: string } => {
    const fallbackArtist = 'Various Artists';
    const name = (cleanName || '').trim();
    if (!name) return { artist: fallbackArtist, title: '' };

    // Prefer an explicit separator with spaces: "Artist - Title"
    const SEP = ' - ';
    if (name.includes(SEP)) {
      const parts = name.split(SEP).map(p => p.trim()).filter(Boolean);

      if (parts.length === 1) return { artist: fallbackArtist, title: parts[0] };
      if (parts.length === 2) return { artist: parts[0] || fallbackArtist, title: parts[1] || '' };

      // Multiple separators: choose a split that keeps common artist patterns like "JAY - Z - Title"
      // while still supporting titles that may contain hyphens.
      const looksLikeArtistContinuation = (segment: string) => {
        const s = (segment || '').trim();
        if (!s) return false;
        if (s.length <= 2) return true;                // "Z", "II"
        if (/^[A-Z0-9]{1,3}$/.test(s)) return true;    // "DJ", "Z", "RZA"
        if (/^[IVX]{1,4}$/i.test(s)) return true;      // Roman numerals
        return false;
      };

      if (looksLikeArtistContinuation(parts[1])) {
        // Join artist segments more naturally (e.g., "JAY-Z" instead of "JAY - Z")
        const tokenish = (x: string) => /^[A-Za-z0-9$.'"]+$/.test(x);
        const joiner =
          parts[1].length <= 3 && parts[0].length <= 12 && tokenish(parts[0]) && tokenish(parts[1])
            ? '-'
            : SEP;

        const artist = `${parts[0]}${joiner}${parts[1]}`.trim() || fallbackArtist;
        const title = parts.slice(2).join(SEP).trim() || parts.slice(1).join(SEP).trim();
        return { artist, title };
      }

      // Default: treat the first segment as artist, rest as title (preserves " - " inside titles)
      return { artist: parts[0] || fallbackArtist, title: parts.slice(1).join(SEP).trim() || name };
    }

    // Fallback: handle "Artist- Title" (dash used as separator with a space after it)
    // Avoid splitting hyphenated names like "Jay-Z" (no space after the hyphen).
    // Also handle "Artist -Title" where there's a space before the dash but not after (common catalog data issue).
    const m = name.match(/^(.+?)\s+-\s*(.*)$/);
    if (m) {
      const artist = (m[1] || '').trim();
      const title = (m[2] || '').trim();
      if (artist && title) return { artist, title };
    }

    // No recognized separator: treat entire string as title
    return { artist: fallbackArtist, title: name };
  };

  // Map API Product to App Product type
  const mapApiProductToAppProduct = (apiProduct: ApiProduct): Product => {
    // Parse product name according to naming convention:
    // - "{artist} - {album name} [tag1] [tag2]" (space before and after dash)
    // - "{artist} -{album name} [tag1] [tag2]" (space before dash, no space after)
    // - "{album name} [tag1] [tag2]" (no dash, just album name)
    
    // Extract tags from brackets like [2 LP], [Import], etc.
    const tagRegex = /\[([^\]]+)\]/g;
    const tags: string[] = [];
    let match;
    let cleanName = apiProduct.name;
    
    // Extract all tags from brackets
    while ((match = tagRegex.exec(apiProduct.name)) !== null) {
      tags.push(match[1].trim());
      cleanName = cleanName.replace(match[0], '').trim();
    }
    
    const { artist, title } = parseArtistAndTitle(cleanName);
    
    // Map category to genre/format
    const categoryLower = apiProduct.category?.toLowerCase() || '';
    let genre = 'Other';
    let format = 'LP';
    
    if (categoryLower.includes('rock') || categoryLower.includes('pop')) genre = 'Rock';
    else if (categoryLower.includes('jazz')) genre = 'Jazz';
    else if (categoryLower.includes('hip') || categoryLower.includes('rap')) genre = 'Hip Hop';
    else if (categoryLower.includes('soul') || categoryLower.includes('funk')) genre = 'Soul / Funk';
    else if (categoryLower.includes('electronic')) genre = 'Electronic';
    else if (categoryLower.includes('country') || categoryLower.includes('folk')) genre = 'Folk';
    else if (categoryLower.includes('punk') || categoryLower.includes('metal')) genre = 'Post-Punk';
    
    if (categoryLower.includes('45') || categoryLower.includes('7"')) format = '45';
    else if (categoryLower.includes('cd')) format = 'CD';
    else if (categoryLower.includes('cassette')) format = 'Cassette';
    else if (categoryLower.includes('reel') || cleanName.toLowerCase().includes('reel to reel')) format = 'Reel to Reel';
    else if (categoryLower.includes('box')) format = '2xLP';
    
    // Combine extracted tags with category and new categories array
    const allTags = [...tags];
    if (apiProduct.category) {
      allTags.push(apiProduct.category);
    }
    if (apiProduct.categories && Array.isArray(apiProduct.categories)) {
        // Add categories that aren't already in tags (avoid duplicates)
        apiProduct.categories.forEach(cat => {
            if (!allTags.includes(cat) && cat !== apiProduct.category) {
                allTags.push(cat);
            }
        });
    }
    
    // Extract format from tags if available (e.g., "2 LP", "LP", "CD")
    let extractedFormat = format; // Default from category mapping
    const formatTag = tags.find(t => 
      /^\d*\s*(LP|CD|Cassette|7"|12"|10"|45|Vinyl)/i.test(t)
    );
    if (formatTag) {
      extractedFormat = formatTag;
    }
    
    // Check if product is a new arrival
    const isNewArrival = allTags.some(t => t.toLowerCase().includes('new vinyl')) || 
                         apiProduct.category?.toLowerCase().includes('new vinyl') ||
                         (apiProduct.categories && apiProduct.categories.some(c => c.toLowerCase().includes('new vinyl')));

    return {
      id: apiProduct.id,
      title: title,
      artist: artist,
      price: apiProduct.price,
      salePrice: undefined, // API doesn't provide this yet
      onSale: false, // Can be determined from tags or category
      coverUrl: apiProduct.imageUrl || getDefaultProductImage(),
      format: extractedFormat,
      genre: genre,
      condition: 'Mint' as const, // Default, API might not have this
      tags: allTags,
      categories: apiProduct.categories, // Pass through original categories array
      isNewArrival: isNewArrival, // True if category contains "New Vinyl"
      inStock: apiProduct.stockCount > 0,
      releaseDate: undefined
    };
  };

  // Helper function to get page title for analytics
  const getPageTitle = (page: Page): string => {
    const titles: Record<Page, string> = {
      'home': 'Home - Spiral Groove Records',
      'events': 'Events - Spiral Groove Records',
      'about': 'About - Spiral Groove Records',
      'locations': 'Locations - Spiral Groove Records',
      'sales': 'Sales - Spiral Groove Records',
      'we-buy': 'We Buy Records - Spiral Groove Records',
      'catalog': 'Catalog - Spiral Groove Records',
      'product': selectedProduct ? `${selectedProduct.title} - Spiral Groove Records` : 'Product - Spiral Groove Records',
      'orders': 'Orders - Spiral Groove Records',
      'receipt': 'Receipt - Spiral Groove Records',
      'order-status': 'Order Status - Spiral Groove Records',
      'faq': 'FAQ - Spiral Groove Records',
      'contact': 'Contact - Spiral Groove Records',
      'staff-picks': 'Staff Picks - Spiral Groove Records',
      'rsvp': 'RSVP - Spiral Groove Records',
      'cart': 'Cart - Spiral Groove Records',
      'checkout': 'Checkout - Spiral Groove Records',
      'order-confirmation': 'Order Confirmation - Spiral Groove Records',
      'settings': 'Settings - Spiral Groove Records',
      'search': 'Search - Spiral Groove Records',
      'privacy': 'Privacy Policy - Spiral Groove Records',
      'terms': 'Terms of Service - Spiral Groove Records',
      'accessibility': 'Accessibility - Spiral Groove Records',
    };
    return titles[page] || 'Spiral Groove Records';
  };

  // Track initial pageview
  useEffect(() => {
    const initialPath = toPathFromState({
      page: currentPage,
      selectedProductId: selectedProduct?.id ?? null,
      filter: currentFilter,
      searchQuery: searchQuery || undefined,
      orderStatusParams: orderStatusParams.id ? orderStatusParams : undefined,
    });
    trackPageView(initialPath, getPageTitle(currentPage));
  }, []); // Only run once on mount

  // Initialize / sync page from URL (supports back/forward). Also migrates old hash URLs to real paths.
  useEffect(() => {
    const applyLocation = () => {
      // Staging gate: force unauthenticated users onto base URL.
      if (requireClientLogin && !clientAuthed) {
        try {
          const intended = window.location.pathname + window.location.search;
          if (intended !== '/' && intended !== '') {
            sessionStorage.setItem('greychair_client_intended', intended);
          }
        } catch {
          // ignore
        }
        if (window.location.pathname !== '/') {
          window.history.replaceState(null, '', '/');
        }
        // Still allow state update for consistency
      }

      const route = parseRouteFromLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });

      // If we came in via hash, immediately migrate to the equivalent real path.
      if (window.location.hash && window.location.hash.startsWith('#')) {
        const migratedPath = toPathFromState({
          page: route.page,
          selectedProductId: route.productId ?? null,
          filter: route.filter,
          searchQuery: route.searchQuery,
          orderStatusParams: route.orderStatusParams,
        });
        window.history.replaceState(null, '', migratedPath);
      }

      setCurrentPage(route.page);
      setCurrentFilter(route.filter);
      setSearchQuery(route.searchQuery ?? '');
      setOrderStatusParams(route.orderStatusParams ?? { id: '', email: '' });

      if (route.page === 'product') {
        const id = route.productId ?? null;
        setPendingProductId(id);
        const product =
          id ? products.find(p => p.id === id) || PRODUCTS.find(p => p.id === id) : undefined;
        setSelectedProduct(product ?? null);
      } else {
        setPendingProductId(null);
        setSelectedProduct(null);
      }
    };

    const onPopState = () => {
      applyLocation();
      scrollToTop('auto');
    };

    applyLocation(); // On mount
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [products, requireClientLogin, clientAuthed]);

  // If we just authenticated the client gate, go to the intended route (or catalog).
  useEffect(() => {
    if (!requireClientLogin || !clientAuthed) return;
    if (window.location.pathname !== '/') return;
    let next = '/catalog';
    try {
      const intended = sessionStorage.getItem('greychair_client_intended');
      if (intended && intended !== '/' && intended.startsWith('/')) next = intended;
      sessionStorage.removeItem('greychair_client_intended');
    } catch {
      // ignore
    }
    window.history.replaceState(null, '', next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [requireClientLogin, clientAuthed]);

  // If we navigated directly to a product URL before products loaded, resolve once products arrive.
  useEffect(() => {
    if (currentPage !== 'product' || !pendingProductId || selectedProduct) return;
    const product = products.find(p => p.id === pendingProductId) || PRODUCTS.find(p => p.id === pendingProductId);
    if (product) setSelectedProduct(product);
  }, [currentPage, pendingProductId, selectedProduct, products]);

  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const apiProducts = await fetchApiProducts();
        
        if (apiProducts.length === 0) {
          // Fallback to mock data if API returns empty
          console.warn('[App] No products from API, using mock data');
          setProducts(PRODUCTS);
        } else {
          // Map API products to app Product type
          const mappedProducts = apiProducts
            .filter(p => {
                // Filter out POS/Generic items starting with "1 - " followed by category/type
                // But preserve legitimate albums that might start with "1 - " (unlikely but possible)
                // We target specifically the ones from the user's provided outlier list
                const posPattern = /^1 - (33|45|CD|DVD|Book|Misc|Poster|Puzzle|Receiver|Sleeves|Speakers|Turntable|Equipment|Reel To Reel|Cassettes|Cleaner|Crates)( New)?$/i;
                return !posPattern.test(p.name);
            })
            .map(mapApiProductToAppProduct);
          setProducts(mappedProducts);
          console.log(`[App] Loaded ${mappedProducts.length} products from API`);
        }
      } catch (err: any) {
        console.error('[App] Failed to load products:', err);
        setProductsError(err.message || 'Failed to load products');
        // Fallback to mock data on error
        setProducts(PRODUCTS);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    setPendingProductId(null);

    // Track product view
    trackProductView({
      id: product.id,
      name: product.title,
      price: product.salePrice || product.price,
      category: product.format || 'Unknown',
      brand: product.artist || 'Spiral Groove Records',
    });

    window.history.pushState(null, '', toPathFromState({ page: 'product', selectedProductId: product.id }));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
            const newQuantity = existing.quantity + quantity;
            const updated = prev.map(item => 
                item.product.id === product.id 
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            // Track add to cart
            trackAddToCart({
              id: product.id,
              name: product.title,
              price: product.salePrice || product.price,
              quantity: quantity,
              category: product.format || 'Unknown',
              brand: product.artist || 'Spiral Groove Records',
            });
            return updated;
        }
        // Track add to cart
        trackAddToCart({
          id: product.id,
          name: product.title,
          price: product.salePrice || product.price,
          quantity: quantity,
          category: product.format || 'Unknown',
          brand: product.artist || 'Spiral Groove Records',
        });
        return [...prev, { product, quantity: quantity }];
    });
    const message = quantity > 1 
      ? `"${product.title}" (${quantity}) added to crate!`
      : `"${product.title}" added to crate!`;
    setToast({ show: true, message });
  };

  const removeFromCart = (productId: string) => {
      setCartItems(prev => {
        const itemToRemove = prev.find(item => item.product.id === productId);
        if (itemToRemove) {
          // Track remove from cart
          trackRemoveFromCart({
            id: itemToRemove.product.id,
            name: itemToRemove.product.title,
            price: itemToRemove.product.salePrice || itemToRemove.product.price,
            quantity: itemToRemove.quantity,
          });
        }
        return prev.filter(item => item.product.id !== productId);
      });
  };

  const updateQuantity = (productId: string, delta: number) => {
      setCartItems(prev => {
          return prev.map(item => {
              if (item.product.id === productId) {
                  const newQuantity = Math.max(1, item.quantity + delta);
                  return { ...item, quantity: newQuantity };
              }
              return item;
          });
      });
  };

  const handlePlaceOrder = (details: any) => {
    const effectiveOrderId =
      details?.orderNumber ||
      details?.orderId ||
      `#ORD-${Math.floor(Math.random() * 10000) + 2024}`;

    // Generate Mock Order Object for Confirmation Page (if used)
    const newOrder: Order = {
        id: effectiveOrderId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: details.deliveryMethod === 'pickup' ? 'Processing' : 'Pending Shipment',
        total: details.total,
        subtotal: details.subtotal,
        tax: details.tax,
        items: cartItems.map(item => ({
            title: item.product.title,
            artist: item.product.artist,
            format: item.product.format,
            price: item.product.salePrice || item.product.price
        })),
        location: details.deliveryMethod === 'pickup' ? 'Milford Shop' : 'Shipping Address'
    };

    // Track purchase
    trackPurchase({
      transaction_id: effectiveOrderId,
      value: details.total || details.subtotal || 0,
      tax: details.tax || 0,
      shipping: details.shipping || 0,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.title,
        price: item.product.salePrice || item.product.price,
        quantity: item.quantity,
        category: item.product.format || 'Unknown',
      })),
    });

    setLastPlacedOrder(newOrder);
    setCartItems([]); // Clear cart

    // After payment, always go to order confirmation.
    // (We still keep order status params handy for guests if they need to check status later.)
    setOrderStatusParams({ id: effectiveOrderId, email: details?.email || '' });
    setCurrentPage('order-confirmation');
    window.history.pushState(null, '', toPathFromState({ page: 'order-confirmation' }));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    setToast({ show: true, message: `Welcome back, ${userData.name}!` });
    // Track login
    trackLogin('email');
  };

  const handleLogout = () => {
    setUser(null);
    setToast({ show: true, message: "Successfully signed out." });
    if (currentPage === 'orders' || currentPage === 'receipt' || currentPage === 'settings') {
        setCurrentPage('home');
    }
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };
  
  const [selectedArtist, setSelectedArtist] = useState<string | undefined>(undefined);

  const handleNavigate = (page: Page, filter?: string, artist?: string) => {
    setCurrentPage(page);
    if (filter) {
        setCurrentFilter(filter);
    }
    if (artist) {
        setSelectedArtist(artist);
    } else if (page !== 'catalog') {
        setSelectedArtist(undefined);
    }
    // Reset filter if navigating to a top-level page that isn't catalog or product
    // (Product page preserves filter via currentFilter state)
    if (page !== 'catalog' && page !== 'product') {
        setCurrentFilter(undefined);
    }
    
    // Update URL path
    if (page === 'search' && filter) {
      // For search page, the 'filter' arg is treated as the search query
      setSearchQuery(filter);
      // Track search
      trackSearch(filter);
    }
    
    // Track begin checkout
    if (page === 'checkout' && cartItems.length > 0) {
      const cartValue = cartItems.reduce((sum, item) => {
        return sum + (item.product.salePrice || item.product.price) * item.quantity;
      }, 0);
      trackBeginCheckout(
        cartItems.map(item => ({
          id: item.product.id,
          name: item.product.title,
          price: item.product.salePrice || item.product.price,
          quantity: item.quantity,
          category: item.product.format || 'Unknown',
        })),
        cartValue
      );
    }
    
    const nextPath = toPathFromState({
      page,
      selectedProductId: selectedProduct?.id ?? null,
      filter: page === 'catalog' ? (filter ?? currentFilter) : undefined,
      searchQuery: page === 'search' ? (filter ?? searchQuery) : undefined,
      orderStatusParams: page === 'order-status' ? orderStatusParams : undefined,
    });
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath !== currentPath) {
      window.history.pushState(null, '', nextPath);
    }

    // Track pageview
    trackPageView(nextPath, getPageTitle(page));

    // Always scroll to the top for navigation requests, even if staying on the same route.
    scrollToTop('smooth');
  };

  const handleViewReceipt = (order: Order) => {
      setSelectedOrder(order);
      setCurrentPage('receipt');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintReceiptFromOrderConfirmation = () => {
    if (!lastPlacedOrder) return;
    setSelectedOrder(lastPlacedOrder);
    setCurrentPage('receipt');
    window.history.pushState(null, '', toPathFromState({ page: 'receipt' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleRSVP = (event: Event) => {
    setSelectedEvent(event);
    setCurrentPage('rsvp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Filter related products for the details page
  const getRelatedProducts = (current: Product | null) => {
      if (!current) return [];
      return products.filter(p => p.id !== current.id && (p.genre === current.genre || p.format === current.format)).slice(0, 4);
  };

  // Calculate total items for badge
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (requireClientLogin && !clientAuthed) {
    return (
      <ClientLoginPage
        viewMode={effectiveViewMode}
        onSuccess={() => {
          setClientAuthed(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden w-full ${effectiveViewMode === 'retro' ? 'bg-cover bg-center bg-no-repeat bg-black selection:bg-brand-orange selection:text-white' : 'bg-white selection:bg-brand-black selection:text-white'}`}
         style={effectiveViewMode === 'retro' ? { backgroundImage: 'url(/bg-linen-black.avif)' } : undefined}>
      
      {/* Noise Texture for Retro Mode */}
      {effectiveViewMode === 'retro' && <div className="grain-overlay"></div>}

      <Header 
        viewMode={viewMode} 
        onCartClick={() => handleNavigate('cart')}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onViewOrders={() => handleNavigate('orders')}
        onAccountSettings={() => handleNavigate('settings')}
        onNavigate={handleNavigate}
        onProductClick={handleProductClick}
        cartCount={cartCount}
        products={products}
        currentPage={currentPage}
        currentFilter={currentFilter}
      />

      <main>
        {currentPage === 'home' && (
            <>
                <Hero 
                    viewMode={effectiveViewMode} 
                    onNavigate={handleNavigate}
                />
                {productsLoading ? (
                    <div className="py-20 text-center">
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                ) : productsError ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500">Error: {productsError}</p>
                        <p className="text-gray-500 text-sm mt-2">Using fallback data</p>
                    </div>
                ) : (
                    <ProductGrid 
                        products={products} 
                        onProductClick={handleProductClick}
                        onQuickAdd={addToCart} 
                        viewMode={effectiveViewMode}
                        initialFilter="New Arrivals"
                        showFilters={false}
                        onViewCatalog={() => handleNavigate('catalog', 'All')}
                        limit={12}
                        onViewMore={() => handleNavigate('catalog', 'New Arrivals')}
                    />
                )}
                <StaffPicks 
                    picks={STAFF_PICKS} 
                    viewMode={effectiveViewMode}
                    onProductClick={handleProductClick}
                />
                <StorySection 
                    viewMode={effectiveViewMode} 
                    onNavigate={handleNavigate}
                />
            </>
        )}

        {currentPage === 'events' && (
            <EventsPage 
                viewMode={effectiveViewMode} 
                onRSVP={handleRSVP}
            />
        )}
        {currentPage === 'about' && <AboutPage viewMode={effectiveViewMode} />}
        {currentPage === 'locations' && <LocationsPage viewMode={effectiveViewMode} />}
        {currentPage === 'sales' && <SalesPage viewMode={effectiveViewMode} onNavigate={handleNavigate} />}
        {currentPage === 'we-buy' && <WeBuyPage viewMode={effectiveViewMode} onNavigate={handleNavigate} />}
        {currentPage === 'catalog' && (
            <>
                {productsLoading ? (
                    <div className="py-20 text-center min-h-screen">
                        <p className="text-gray-500">Loading catalog...</p>
                    </div>
                ) : productsError ? (
                    <div className="py-20 text-center min-h-screen">
                        <p className="text-red-500">Error: {productsError}</p>
                        <p className="text-gray-500 text-sm mt-2">Using fallback data</p>
                    </div>
                ) : (
                    <CatalogPage 
                        viewMode={effectiveViewMode} 
                        products={products}
                        onProductClick={handleProductClick}
                        onQuickAdd={addToCart}
                        initialFilter={currentFilter}
                        initialArtist={selectedArtist}
                        onHomeClick={() => handleNavigate('home')}
                        onNavigate={handleNavigate}
                        onFilterChange={(newFilter) => setCurrentFilter(newFilter)}
                    />
                )}
            </>
        )}
        {currentPage === 'search' && (
            <SearchPage 
                viewMode={effectiveViewMode}
                products={products}
                searchQuery={searchQuery}
                onProductClick={handleProductClick}
                onQuickAdd={addToCart}
                onHomeClick={() => handleNavigate('home')}
                onNavigate={handleNavigate}
            />
        )}
        {currentPage === 'product' && selectedProduct && (
            <ProductDetailsPage
                product={selectedProduct}
                viewMode={effectiveViewMode}
                onAddToCart={addToCart}
                // When going back, return to catalog with the preserved filter
                onBack={() => handleNavigate('catalog', currentFilter || 'All')}
                onProductClick={handleProductClick}
                relatedProducts={getRelatedProducts(selectedProduct)}
                previousFilter={currentFilter}
                onNavigate={handleNavigate}
            />
        )}
        {currentPage === 'cart' && (
            <CartPage 
                cartItems={cartItems}
                viewMode={effectiveViewMode}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onNavigate={handleNavigate}
                onCheckout={() => handleNavigate('checkout')}
            />
        )}
        {currentPage === 'checkout' && (
            <CheckoutPage 
                cartItems={cartItems}
                viewMode={effectiveViewMode}
                user={user}
                onLoginClick={() => setIsAuthModalOpen(true)}
                onBack={() => handleNavigate('cart')}
                onPlaceOrder={handlePlaceOrder}
            />
        )}
        {currentPage === 'order-confirmation' && lastPlacedOrder && (
            <OrderConfirmationPage 
                order={lastPlacedOrder}
                viewMode={effectiveViewMode}
                onNavigate={handleNavigate}
                onPrintReceipt={handlePrintReceiptFromOrderConfirmation}
            />
        )}
        {currentPage === 'orders' && (
            <OrdersPage 
                viewMode={effectiveViewMode}
                onNavigate={handleNavigate}
                onViewReceipt={handleViewReceipt}
                onLoginClick={() => setIsAuthModalOpen(true)}
            />
        )}
        {currentPage === 'receipt' && selectedOrder && (
            <ReceiptPage 
                order={selectedOrder}
                viewMode={effectiveViewMode}
                onBack={() => handleNavigate('orders')}
            />
        )}
        {currentPage === 'order-status' && (
            <OrderStatusPage 
                viewMode={effectiveViewMode} 
                onNavigate={handleNavigate}
                onViewReceipt={handleViewReceipt}
                initialOrderNumber={orderStatusParams.id}
                initialEmail={orderStatusParams.email}
            />
        )}
        {currentPage === 'faq' && (
            <FAQPage viewMode={effectiveViewMode} />
        )}
        {currentPage === 'contact' && (
            <ContactPage viewMode={effectiveViewMode} />
        )}
        {currentPage === 'staff-picks' && (
            <StaffPicksPage 
                viewMode={effectiveViewMode}
                onProductClick={handleProductClick}
                onNavigate={handleNavigate}
            />
        )}
        {currentPage === 'rsvp' && selectedEvent && (
            <RSVPPage 
                viewMode={effectiveViewMode}
                event={selectedEvent}
                onBack={() => handleNavigate('events')}
            />
        )}
        {currentPage === 'settings' && (
            <SettingsPage 
                user={user}
                viewMode={effectiveViewMode}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
            />
        )}
        {currentPage === 'privacy' && (
            <PrivacyPage 
                viewMode={effectiveViewMode}
                onNavigate={handleNavigate}
            />
        )}
        {currentPage === 'terms' && (
            <TermsPage 
                viewMode={effectiveViewMode}
                onNavigate={handleNavigate}
            />
        )}
        {currentPage === 'accessibility' && (
            <AccessibilityPage 
                viewMode={effectiveViewMode}
                onNavigate={handleNavigate}
            />
        )}
      </main>

      <Footer viewMode={effectiveViewMode} onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        viewMode={effectiveViewMode}
      />

      <Toast 
        isVisible={toast.show} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, show: false })}
        viewMode={effectiveViewMode}
      />

      <Chatbot />
    </div>
  );
}

export default App;
