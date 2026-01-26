// src/components/layout/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const QUICK_LINKS = [
  { label: "Staff Login", href: "/staff" },
  { label: "Citizen Registration", href: "/register" },
  { label: "Report Issue", href: "/report" },
  { label: "Track Status", href: "/track" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border pt-16 pb-8 mt-auto no-print">
      <div className="container-gov">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-sm">
                SP
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                Smart Pokhara
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              The official digital gateway for services, information, and civic 
              engagement in Pokhara Metropolitan City.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-foreground mb-6">Legal</h3>
            <ul className="space-y-3 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-foreground mb-6">Contact</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                New Road, Pokhara-8, Kaski
              </li>
              <li className="flex gap-3 font-mono">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                +977-61-521105
              </li>
              <li className="flex gap-3">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                info@pokharamun.gov.np
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} Pokhara Metropolitan City. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary font-medium">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};