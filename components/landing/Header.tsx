// src/components/layout/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Landmark, LogIn, Menu, X, ChevronRight, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { label: "Public Services", href: "#services" },
  { label: "Ward Directory", href: "#wards" },
  { label: "City Projects", href: "#projects" },
  { label: "Notices", href: "#notices" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 no-print ${
      isScrolled 
        ? "border-b border-border bg-background/80 backdrop-blur-md shadow-sm py-2" 
        : "bg-transparent py-4"
    }`}>
      <div className="container-gov flex h-16 items-center justify-between">
        
        {/* Logo & Branding */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
            <Landmark className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold leading-none uppercase tracking-tight text-foreground">
              Smart Pokhara
            </span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">
              Metropolitan City
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="hidden md:flex btn-gov-ghost gap-2 text-xs font-bold text-primary">
            <Globe className="h-4 w-4" />
            नेपाली
          </button>
          
          <ThemeToggle />
          
          <div className="hidden sm:flex items-center gap-3 border-l border-border ml-2 pl-4">
            <Link href="/login" className="btn-gov btn-gov-ghost text-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn-gov btn-gov-primary rounded-full px-6">
              Register
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-accent rounded-md transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-card border-b border-border shadow-xl animate-in slide-in-from-top-2">
          <nav className="container-gov py-6 flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between rounded-lg p-4 text-base font-medium hover:bg-accent text-foreground transition-colors"
              >
                {item.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <Link href="/login" className="btn-gov-outline justify-center py-3">Login</Link>
              <Link href="/register" className="btn-gov-primary justify-center py-3">Register</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};