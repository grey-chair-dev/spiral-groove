"use client";

export default function FloatingIllustrations() {
  return (
    <>
      {/* Smiling Sun */}
      <div className="floating-illustration top-10 right-10 animate-bob">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="25" fill="#CBAE88" />
          <circle cx="20" cy="20" r="3" fill="#1C1C1C" />
          <circle cx="40" cy="20" r="3" fill="#1C1C1C" />
          <path d="M20 35 Q30 40 40 35" stroke="#1C1C1C" strokeWidth="2" fill="none" />
          <path d="M30 5 L30 10 M30 50 L30 55 M5 30 L10 30 M50 30 L55 30" stroke="#CBAE88" strokeWidth="2" />
          <path d="M15 15 L18 18 M45 15 L42 18 M15 45 L18 42 M45 45 L42 42" stroke="#CBAE88" strokeWidth="2" />
        </svg>
      </div>

      {/* Flower */}
      <div className="floating-illustration top-1/3 left-5 animate-float" style={{ animationDelay: '1s' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="8" fill="#E96B3A" />
          <ellipse cx="20" cy="10" rx="4" ry="6" fill="#3AA6A3" />
          <ellipse cx="30" cy="20" rx="6" ry="4" fill="#3AA6A3" />
          <ellipse cx="20" cy="30" rx="4" ry="6" fill="#3AA6A3" />
          <ellipse cx="10" cy="20" rx="6" ry="4" fill="#3AA6A3" />
        </svg>
      </div>

      {/* Smiley Face */}
      <div className="floating-illustration bottom-20 left-10 animate-bob" style={{ animationDelay: '2s' }}>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <circle cx="25" cy="25" r="22" fill="#CBAE88" stroke="#E96B3A" strokeWidth="2" />
          <circle cx="18" cy="20" r="3" fill="#1C1C1C" />
          <circle cx="32" cy="20" r="3" fill="#1C1C1C" />
          <path d="M18 30 Q25 35 32 30" stroke="#1C1C1C" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Mushroom */}
      <div className="floating-illustration top-1/2 right-20 animate-float" style={{ animationDelay: '0.5s' }}>
        <svg width="35" height="45" viewBox="0 0 35 45" fill="none">
          <ellipse cx="17.5" cy="15" rx="12" ry="8" fill="#E96B3A" />
          <ellipse cx="12" cy="15" rx="3" ry="4" fill="#F5EBDD" />
          <ellipse cx="23" cy="15" rx="3" ry="4" fill="#F5EBDD" />
          <rect x="14" y="20" width="7" height="20" fill="#3AA6A3" />
        </svg>
      </div>

      {/* Rainbow */}
      <div className="floating-illustration bottom-10 right-1/4 animate-pulse-gentle">
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
          <path d="M0 30 Q20 20 40 30 T80 30" stroke="#E96B3A" strokeWidth="3" fill="none" />
          <path d="M0 32 Q20 22 40 32 T80 32" stroke="#CBAE88" strokeWidth="3" fill="none" />
          <path d="M0 34 Q20 24 40 34 T80 34" stroke="#3AA6A3" strokeWidth="3" fill="none" />
        </svg>
      </div>
    </>
  );
}

