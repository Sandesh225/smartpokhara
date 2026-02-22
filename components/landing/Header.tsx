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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Map the navigation labels from constants to your actual file routes
  const getRoute = (label: string) => {
    switch (label) {
      case "Home":
        return "/";
      case "Public Services":
        return "/services";
      case "Ward Directory":
        return "/wards";
      case "City Projects":
        return "/projects";
      case "Notices":
        return "/notices";
      default:
        return "/";
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is active
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
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
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
            }`}
          >
            {/* Logo & Branding */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary dark:bg-primary/90 text-primary-foreground shadow-lg transition-all group-hover:scale-105">
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base sm:text-lg font-bold leading-none uppercase text-foreground">
                  Smart Pokhara
                </span>
                <span className="text-xs sm:text-xs font-bold text-secondary dark:text-secondary/90 uppercase tracking-widest mt-0.5">
                  Metropolitan City
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={getRoute(item.label)}
                  className="group relative px-3 xl:px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all rounded-full" />
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language Toggle */}
              <button className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all">
                <Globe className="h-4 w-4" />
                <span>NP</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <ThemeToggle />

              {/* Desktop Auth */}
              <div className="hidden sm:flex items-center gap-2 border-l border-border ml-2 pl-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-md transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="lg:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="lg:hidden fixed top-[64px] sm:top-[80px] left-0 right-0 z-40 bg-card border-t border-border shadow-2xl overflow-y-auto max-h-[calc(100vh-64px)] animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-6">
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={getRoute(item.label)}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl p-4 hover:bg-accent transition-all group border border-transparent hover:border-border"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.desc}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Actions */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-3 font-bold border-2 border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-3 font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 transition-all"
                >
                  Register
                </Link>
              </div>

              {/* Emergency / Support Card */}
              <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                <a
                  href="tel:+97761521105"
                  className="flex items-center gap-3 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Emergency Support
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      +977-61-521105
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};