"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Send,
  ArrowRight,
} from "lucide-react";
import {
  QUICK_LINKS,
  LEGAL_LINKS,
  SOCIAL_LINKS,
  CONTACT_INFO,
} from "@/lib/constants";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-muted/40 border-t border-border mt-auto no-print transition-colors duration-400">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="pt-12 sm:pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 flex flex-col">
              <Link
                href="/"
                className="inline-flex items-center gap-3 mb-6 group w-max"
              >
                <div className="relative h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden">
                  <Image
                    src="/logo.svg"
                    alt="Smart Pokhara"
                    fill
                    className="object-contain p-2.5"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-xl text-foreground leading-none uppercase tracking-tight">
                    Smart Pokhara
                  </span>
                  <span className="font-heading font-bold text-sm text-secondary uppercase tracking-wider mt-1.5">
                    Metropolitan City
                  </span>
                </div>
              </Link>

              <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-sm">
                The official digital gateway for services, information, and
                civic engagement in Pokhara Metropolitan City.
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 mb-8">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:border-primary/30 shadow-sm"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="hidden sm:block mt-auto">
                <p className="font-heading font-bold text-sm text-foreground mb-3">
                  Stay Updated
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-2.5 text-sm font-sans rounded-xl bg-card border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner-sm placeholder:text-muted-foreground"
                  />
                  <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:bg-primary/90 transition-all duration-300 active:scale-95 shadow-md shadow-primary/20">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 lg:ml-auto">
              <h3 className="font-heading font-extrabold text-foreground mb-6 text-sm uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-4">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-3 group"
                    >
                      <span className="text-muted-foreground/50 group-hover:text-primary transition-colors">{link.icon}</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-3 lg:ml-8">
              <h3 className="font-heading font-extrabold text-foreground mb-6 text-sm uppercase tracking-wider">
                Legal & Policies
              </h3>
              <ul className="space-y-4">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-3 group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-secondary group-hover:scale-150 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h3 className="font-heading font-extrabold text-foreground mb-6 text-sm uppercase tracking-wider">
                Get in Touch
              </h3>
              <ul className="space-y-5">
                <li>
                  <a
                    href={CONTACT_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 font-sans text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="leading-relaxed pt-1">
                      {CONTACT_INFO.address}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="flex gap-4 font-mono text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Phone className="w-4 h-4 text-primary group-hover:-rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="pt-1.5">{CONTACT_INFO.phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="flex gap-4 font-sans text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors break-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Mail className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="pt-1.5">{CONTACT_INFO.email}</span>
                  </a>
                </li>
              </ul>

              <a
                href={CONTACT_INFO.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 px-5 py-3 text-sm font-heading font-bold text-secondary bg-secondary/10 rounded-xl hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 group"
              >
                Visit Official Website
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
            
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="text-sm font-sans text-muted-foreground text-center md:text-left">
              <p className="mb-1 font-medium">
                © {currentYear} Pokhara Metropolitan City. All rights reserved.
              </p>
              <p className="text-xs opacity-70">
                Government of Nepal | Gandaki Province
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* System Status Indicator using pure semantic styling */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                  All Systems Operational
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-sans text-muted-foreground">
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