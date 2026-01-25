import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Clock, MapPin, Phone, Mail } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const STORE_INFO = {
  address: '215B Main Street, Milford, OH 45150',
  phone: '(513) 248-0000',
  email: 'info@spiralgrooverecords.com',
  hours: {
    monday: '10:00 AM - 8:00 PM',
    tuesday: '10:00 AM - 8:00 PM',
    wednesday: '10:00 AM - 8:00 PM',
    thursday: '10:00 AM - 8:00 PM',
    friday: '10:00 AM - 8:00 PM',
    saturday: '10:00 AM - 8:00 PM',
    sunday: '12:00 PM - 6:00 PM',
  },
};

const QUICK_REPLIES = [
  { text: 'Store Hours', keyword: 'hours' },
  { text: 'Location', keyword: 'location' },
  { text: 'Contact', keyword: 'contact' },
  { text: 'Products', keyword: 'products' },
];

const getBotResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase().trim();

  // Store hours
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = STORE_INFO.hours[today as keyof typeof STORE_INFO.hours] || STORE_INFO.hours.monday;
    return `We're open ${hours} today! Our regular hours are:\n\nMonday - Saturday: 10:00 AM - 8:00 PM\nSunday: 12:00 PM - 6:00 PM`;
  }

  // Location/Address
  if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
    return `We're located at:\n\n${STORE_INFO.address}\n\nCome visit us in Milford, Ohio!`;
  }

  // Contact info
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('call')) {
    return `You can reach us at:\n\n📞 Phone: ${STORE_INFO.phone}\n📧 Email: ${STORE_INFO.email}\n\nWe'd love to hear from you!`;
  }

  // Products/Catalog
  if (lowerMessage.includes('product') || lowerMessage.includes('catalog') || lowerMessage.includes('vinyl') || lowerMessage.includes('record') || lowerMessage.includes('buy') || lowerMessage.includes('shop')) {
    return `Browse our catalog to see our curated selection of vinyl records, hi-fi gear, and more! You can filter by genre, format, and more. Check out our Staff Picks for recommendations!`;
  }

  // Order/Shipping
  if (lowerMessage.includes('order') || lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('pickup')) {
    return `We offer local pickup at our store! After placing an order, you'll receive a confirmation email. When your order is ready, we'll send you another email. Just bring a valid ID when you pick it up!`;
  }

  // Returns/Refunds
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
    return `For returns or exchanges, please contact us at ${STORE_INFO.email} or call ${STORE_INFO.phone}. We're happy to help!`;
  }

  // Events
  if (lowerMessage.includes('event') || lowerMessage.includes('show') || lowerMessage.includes('concert')) {
    return `Check out our Events page to see upcoming shows, listening parties, and special events at the store!`;
  }

  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.match(/^hi$|^hey$|^hello$/)) {
    return `Hey there! 👋 Welcome to Spiral Groove Records! How can I help you today?`;
  }

  // Help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
    return `I can help you with:\n\n• Store hours and location\n• Contact information\n• Product information\n• Order questions\n• Returns and exchanges\n• Events\n\nJust ask me anything!`;
  }

  // Default response
  return `Thanks for your message! For specific questions, you can:\n\n• Check our FAQ page\n• Email us at ${STORE_INFO.email}\n• Call us at ${STORE_INFO.phone}\n\nIs there anything else I can help with?`;
};

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! 👋 Welcome to Spiral Groove Records! I'm here to help. What can I do for you?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show popup after delay if chat hasn't been opened and popup hasn't been dismissed
  useEffect(() => {
    // Check if popup was previously dismissed
    const popupDismissed = localStorage.getItem('chatbot-popup-dismissed');
    if (popupDismissed === 'true') {
      return;
    }

    // Show popup after 4 seconds
    popupTimeoutRef.current = setTimeout(() => {
      if (!isOpen) {
        setShowPopup(true);
      }
    }, 4000);

    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Hide popup when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowPopup(false);
    }
  }, [isOpen]);

  const handleDismissPopup = () => {
    setShowPopup(false);
    localStorage.setItem('chatbot-popup-dismissed', 'true');
  };

  const handleOpenChat = () => {
    setShowPopup(false);
    setIsOpen(true);
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickReply = (keyword: string) => {
    handleSendMessage(keyword);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const chatbotContent = (
    <>
      {/* Help Popup */}
      {showPopup && !isOpen && (
        <div
          className="bg-brand-cream border-4 border-brand-black rounded-lg shadow-retro p-4 max-w-[280px] animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '24px',
            zIndex: 10000,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-brand-orange" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-black mb-2">
                We are here to help! 💬
              </p>
              <p className="text-xs text-gray-700 mb-3">
                Have a question? Click the chat button to get started.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenChat}
                  className="flex-1 bg-brand-orange text-brand-black text-xs font-bold px-3 py-1.5 rounded shadow-retro-sm hover:shadow-retro transition-all"
                >
                  Chat Now
                </button>
                <button
                  onClick={handleDismissPopup}
                  className="text-gray-600 hover:text-brand-black text-xs font-bold px-2"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Arrow pointing to button */}
          <div
            className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-brand-black"
            style={{ transform: 'rotate(180deg)' }}
          />
        </div>
      )}

      {/* Chat Button - Vinyl Record Style */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="z-[9999] w-20 h-20 rounded-full shadow-retro hover:shadow-retro-hover transition-all group relative overflow-hidden"
          aria-label="Open chat"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            top: 'auto',
            left: 'auto',
            backgroundColor: '#231F20',
            border: '3px solid #231F20',
            boxShadow: '4px 4px 0px 0px #231F20',
          }}
        >
          {/* Record Grooves - Using div elements for better compatibility */}
          {[30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((radius, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${radius * 2}%`,
                height: `${radius * 2}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'spin-slow 8s linear infinite',
                opacity: 0.5,
                border: '0.5px solid #FFF9F0',
              }}
            />
          ))}
          
          {/* Center label (like a record label) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-retro-sm"
              style={{
                background: 'radial-gradient(circle, #FFF9F0 0%, #FFF9F0 60%, #231F20 60%, #231F20 100%)',
                border: '2px solid #231F20',
              }}
            >
              <div className="w-6 h-6 rounded-full bg-brand-orange border-2 border-brand-black flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-brand-black" />
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="z-[9999] w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-brand-cream border-4 border-brand-black rounded-lg shadow-retro flex flex-col"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
          }}
        >
          {/* Header */}
          <div className="bg-brand-black text-brand-cream p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-display text-lg">Chat with Groovy</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-brand-cream hover:text-brand-orange transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-retro-sm ${
                    message.sender === 'user'
                      ? 'bg-brand-orange text-brand-black'
                      : 'bg-white text-brand-black border-2 border-brand-black'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-brand-black border-2 border-brand-black rounded-lg p-3 shadow-retro-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-brand-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-brand-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-brand-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.keyword}
                    onClick={() => handleQuickReply(reply.keyword)}
                    className="text-xs bg-white border-2 border-brand-black rounded-full px-3 py-1 hover:bg-brand-orange transition-colors shadow-retro-sm"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t-4 border-brand-black p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-2 border-brand-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="bg-brand-orange text-brand-black rounded-lg px-4 py-2 shadow-retro-sm hover:shadow-retro disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Need more help? <a href="/contact" className="text-brand-orange hover:underline">Contact us</a>
            </p>
          </div>
        </div>
      )}
    </>
  );

  // Render to document body to avoid positioning issues
  if (typeof document !== 'undefined') {
    return createPortal(chatbotContent, document.body);
  }
  
  return chatbotContent;
};
