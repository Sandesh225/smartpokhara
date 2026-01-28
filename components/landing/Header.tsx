// src/components/layout/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  Menu,
  X,
  ChevronRight,
  Globe,
  ChevronDown,
  Phone,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  {
    label: "Public Services",
    href: "#services",
    desc: "Civic services & utilities",
  },
  { label: "Ward Directory", href: "#wards", desc: "Find your ward office" },
  { label: "City Projects", href: "#projects", desc: "Ongoing developments" },
  { label: "Notices", href: "#notices", desc: "Official announcements" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside and prevent body scroll
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 no-print border-b border-border dark:border-border/50 ${
          isScrolled
            ? "bg-background/95 dark:bg-background/90 backdrop-blur-md shadow-sm"
            : "bg-background/80 dark:bg-background/70 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          }`}>
            {/* Logo & Branding */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary dark:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base sm:text-lg font-bold leading-none uppercase tracking-tight text-foreground dark:text-foreground/95">
                  Smart Pokhara
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-secondary dark:text-secondary/90 uppercase tracking-widest mt-0.5">
                  Metropolitan City
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative px-3 xl:px-4 py-2 text-sm font-medium text-muted-foreground dark:text-muted-foreground/90 hover:text-foreground dark:hover:text-foreground hover:bg-accent dark:hover:bg-accent/80 rounded-lg transition-all duration-200"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary dark:bg-primary/90 group-hover:w-3/4 transition-all duration-200 rounded-full" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language Toggle - Desktop */}
              <button className="hidden md:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 hover:bg-accent dark:hover:bg-accent/80 rounded-lg transition-all">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xl:inline">नेपाली</span>
                <span className="xl:hidden">NP</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2 border-l border-border dark:border-border/50 ml-2 pl-3 sm:pl-4">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground dark:text-muted-foreground/90 hover:text-foreground dark:hover:text-foreground hover:bg-accent dark:hover:bg-accent/80 rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-primary dark:bg-primary/90 text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <span className="hidden sm:inline">Register</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className="lg:hidden p-2 text-foreground dark:text-foreground/90 hover:bg-accent dark:hover:bg-accent/80 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="lg:hidden fixed top-[64px] sm:top-[80px] left-0 right-0 bottom-0 z-40 bg-card dark:bg-card/95 border-t border-border dark:border-border/50 shadow-2xl overflow-y-auto animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <nav className="py-4 sm:py-6 max-w-2xl mx-auto">
                {/* Navigation Links */}
                <div className="space-y-1 mb-4 sm:mb-6">
                  {NAV_ITEMS.map((item, idx) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 sm:p-4 text-sm sm:text-base font-medium hover:bg-accent dark:hover:bg-accent/80 text-foreground dark:text-foreground/95 transition-all group border border-transparent hover:border-border dark:hover:border-border/50"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.label}</span>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground/80 mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/80 group-hover:text-primary dark:group-hover:text-primary/90 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>

                {/* Language Toggle - Mobile */}
                <button className="w-full flex items-center justify-between rounded-xl p-3 sm:p-4 text-sm sm:text-base font-medium hover:bg-accent dark:hover:bg-accent/80 text-foreground dark:text-foreground/95 transition-all mb-4 sm:mb-6 border border-border dark:border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary dark:text-primary/90" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Switch to Nepali</span>
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground/80">
                        नेपाली भाषामा हेर्नुहोस्
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/80" />
                </button>

                {/* Auth Buttons - Mobile */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border dark:border-border/50 mb-4 sm:mb-6">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-bold border-2 border-primary dark:border-primary/80 text-primary dark:text-primary/90 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-bold bg-primary dark:bg-primary/90 text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    Register
                  </Link>
                </div>

                {/* Quick Contact */}
                <div className="rounded-xl bg-muted/50 dark:bg-muted/30 p-4 border border-border dark:border-border/50">
                  <p className="text-xs sm:text-sm font-semibold text-foreground dark:text-foreground/95 mb-3">
                    Need Assistance?
                  </p>
                  <a
                    href="tel:+977615521105"
                    className="flex items-center gap-3 text-sm text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary font-medium transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Call Us</span>
                      <span className="font-mono text-xs">+977-61-521105</span>
                    </div>
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};