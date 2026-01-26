// components/ui/Logo.tsx
"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  isLink?: boolean;
}

export const Logo = ({ 
  className = "h-8 w-8", 
  showText = false, 
  isLink = false 
}: LogoProps) => {
  
  const LogoContent = (
    <div className="flex items-center gap-2 group select-none">
      {/* TRANSPARENT BRANDED ICON 
          ViewBox is optimized for a square, small-scale presentation
      */}
      <svg
        viewBox="0 0 100 100"
        className={`${className} drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Smart Pokhara"
      >
        {/* The Himalayas: Machhapuchhre Peak */}
        <path
          d="M10 75 L40 25 L60 55 L80 15 L95 75 Z"
          className="fill-primary"
          strokeLinejoin="round"
        />
        
        {/* Snow Accent (Minimalist) */}
        <path
          d="M40 25 L32 38 L40 35 L48 40 Z"
          fill="white"
          fillOpacity="0.9"
        />
        
        {/* The Green City (Foundation/Sustainability) */}
        <path
          d="M5 75 H95 V85 C95 87.2 93.2 89 91 89 H9 C6.8 89 5 87.2 5 85 V75 Z"
          className="fill-secondary"
        />
        
        {/* Digital Connectivity Dot (The 'Smart' indicator) */}
        <circle cx="80" cy="15" r="4" className="fill-secondary animate-pulse" />
      </svg>

      {showText && (
        <div className="flex flex-col justify-center">
          <h1 className="font-heading text-sm font-black tracking-tight leading-none text-foreground">
            SMART<br/>POKHARA
          </h1>
        </div>
      )}
    </div>
  );

  if (isLink) {
    return <Link href="/">{LogoContent}</Link>;
  }

  return LogoContent;
};