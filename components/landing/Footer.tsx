// src/components/layout/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Landmark,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ExternalLink,
  Send,
  ArrowRight,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Staff Login", href: "/staff", icon: "👤" },
  { label: "Citizen Registration", href: "/register", icon: "📝" },
  { label: "Report Issue", href: "/report", icon: "📢" },
  { label: "Track Status", href: "/track", icon: "🔍" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Data Protection", href: "/data-protection" },
];

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: "https://facebook.com/pokharamun",
    label: "Facebook",
    color: "hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500",
  },
  {
    icon: Twitter,
    href: "https://twitter.com/pokharamun",
    label: "Twitter",
    color: "hover:bg-sky-500/10 hover:border-sky-500 hover:text-sky-500",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/pokharamun",
    label: "Instagram",
    color: "hover:bg-pink-500/10 hover:border-pink-500 hover:text-pink-500",
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@pokharamun",
    label: "YouTube",
    color: "hover:bg-red-500/10 hover:border-red-500 hover:text-red-500",
  },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-muted/50 dark:bg-card/50 border-t border-border dark:border-border/50 mt-auto no-print transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="pt-12 sm:pt-16 pb-10 sm:pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
            {/* Brand Column - Spans 4 columns on lg */}
            <div className="lg:col-span-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 sm:gap-2.5 mb-5 sm:mb-6 group"
              >
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-primary dark:bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <Landmark className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-lg sm:text-xl text-foreground dark:text-foreground/95 leading-none uppercase tracking-tight">
                    Smart Pokhara
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-secondary dark:text-secondary/90 uppercase tracking-widest mt-1">
                    Metropolitan City
                  </span>
                </div>
              </Link>

              <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 leading-relaxed mb-5 sm:mb-6 max-w-sm">
                The official digital gateway for services, information, and
                civic engagement in Pokhara Metropolitan City.
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-card dark:bg-muted/30 border border-border dark:border-border/50 flex items-center justify-center text-muted-foreground transition-all duration-200 hover:shadow-md ${social.color}`}
                  >
                    <social.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </a>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground dark:text-foreground/95 mb-3">
                  Stay Updated
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 text-sm rounded-lg bg-background dark:bg-card border border-border dark:border-border/50 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/80 transition-all"
                  />
                  <button className="px-4 py-2 bg-primary dark:bg-primary/90 text-primary-foreground rounded-lg hover:bg-primary/90 dark:hover:bg-primary transition-all hover:shadow-md">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links - Spans 2 columns on lg */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-foreground dark:text-foreground/95 mb-4 sm:mb-5 text-sm uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 transition-colors inline-flex items-center gap-2.5 group"
                    >
                      <span className="text-base">{link.icon}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal - Spans 3 columns on lg */}
            <div className="lg:col-span-3">
              <h3 className="font-bold text-foreground dark:text-foreground/95 mb-4 sm:mb-5 text-sm uppercase tracking-wider">
                Legal & Policies
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="h-1 w-1 rounded-full bg-secondary dark:bg-secondary/80 group-hover:w-2 transition-all" />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact - Spans 3 columns on lg */}
            <div className="lg:col-span-3">
              <h3 className="font-bold text-foreground dark:text-foreground/95 mb-4 sm:mb-5 text-sm uppercase tracking-wider">
                Get in Touch
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <a
                    href="https://maps.google.com/?q=New+Road+Pokhara"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 transition-colors group"
                  >
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary dark:text-primary/90 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="leading-relaxed">
                      New Road, Pokhara-8, Kaski, Nepal
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+977615521105"
                    className="flex gap-3 text-sm sm:text-base font-mono text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 transition-colors group"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary dark:text-primary/90 mt-0.5 group-hover:rotate-12 transition-transform" />
                    <span>+977-61-521105</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@pokharamun.gov.np"
                    className="flex gap-3 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 transition-colors break-all group"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-primary dark:text-primary/90 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>info@pokharamun.gov.np</span>
                  </a>
                </li>
              </ul>

              {/* Official Website Link */}
              <a
                href="https://pokharamun.gov.np"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary dark:text-secondary/90 hover:text-secondary/80 dark:hover:text-secondary bg-secondary/10 dark:bg-secondary/20 rounded-lg hover:bg-secondary/20 dark:hover:bg-secondary/30 transition-all hover:shadow-md"
              >
                Visit Official Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border dark:border-border/50 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            {/* Copyright */}
            <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/80 text-center sm:text-left">
              <p className="mb-1 sm:mb-0">
                &copy; {currentYear} Pokhara Metropolitan City. All rights
                reserved.
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
                Government of Nepal | Gandaki Pradesh
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              {/* System Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card dark:bg-muted/30 border border-border dark:border-border/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary dark:bg-secondary/80 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary dark:bg-secondary/90"></span>
                </span>
                <span className="text-xs font-semibold text-secondary dark:text-secondary/90">
                  All Systems Operational
                </span>
              </div>

              {/* Made with love */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-muted-foreground/70">
                <span>Built with</span>
                <span className="text-base animate-pulse">💚</span>
                <span>for Pokhara</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};