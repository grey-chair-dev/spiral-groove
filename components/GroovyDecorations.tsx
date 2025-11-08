"use client";

import React from "react";

// Groovy Daisy Component
export function GroovyDaisy({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Petals */}
      <circle cx="50" cy="20" r="15" fill="#FF6B9D" opacity="0.8" />
      <circle cx="80" cy="50" r="15" fill="#FFD23F" opacity="0.8" />
      <circle cx="50" cy="80" r="15" fill="#00CED1" opacity="0.8" />
      <circle cx="20" cy="50" r="15" fill="#9B59B6" opacity="0.8" />
      <circle cx="65" cy="30" r="12" fill="#FF6B35" opacity="0.7" />
      <circle cx="35" cy="30" r="12" fill="#FF6B9D" opacity="0.7" />
      <circle cx="65" cy="70" r="12" fill="#00CED1" opacity="0.7" />
      <circle cx="35" cy="70" r="12" fill="#9B59B6" opacity="0.7" />
      {/* Center */}
      <circle cx="50" cy="50" r="12" fill="#FFD23F" />
      <circle cx="50" cy="50" r="8" fill="#FF6B35" />
    </svg>
  );
}

// Peace Sign Component
export function PeaceSign({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#peaceGradient)"
        strokeWidth="4"
      />
      <path
        d="M 50 20 L 50 50 M 30 35 L 50 50 M 70 35 L 50 50"
        stroke="url(#peaceGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="peaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#FFD23F" />
          <stop offset="100%" stopColor="#9B59B6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Wavy Divider Component
export function GroovyDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
          fill="url(#wavyGradient)"
        />
        <defs>
          <linearGradient id="wavyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#FFD23F" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00CED1" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#FF6B9D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9B59B6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Groovy Pattern Background
export function GroovyPattern({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 opacity-10 ${className}`}
      style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,107,53,0.1) 20px, rgba(255,107,53,0.1) 40px),
          repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,210,63,0.1) 20px, rgba(255,210,63,0.1) 40px)
        `,
      }}
    />
  );
}

// Floating Groovy Elements
export function FloatingGroovyElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-20 left-10 animate-pulse-slow">
        <GroovyDaisy size={60} />
      </div>
      <div className="absolute top-40 right-20 animate-pulse-slow" style={{ animationDelay: "1s" }}>
        <PeaceSign size={50} />
      </div>
      <div className="absolute bottom-40 left-20 animate-pulse-slow" style={{ animationDelay: "2s" }}>
        <GroovyDaisy size={45} />
      </div>
      <div className="absolute bottom-20 right-10 animate-pulse-slow" style={{ animationDelay: "0.5s" }}>
        <PeaceSign size={55} />
      </div>
    </div>
  );
}

