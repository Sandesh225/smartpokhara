// src/components/landing/CTASection.tsx
"use client";

import React from "react";

export const CTASection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 px-4 bg-background bg-background/90 transition-colors">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 md:p-16 text-center text-primary-foreground shadow-2xl relative overflow-hidden">
          {/* Decorative Blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-6">
              Ready to improve your neighborhood?
            </h2>

            <p className="text-primary-foreground/90 text-lg mb-10 leading-relaxed">
              Join your neighbors in making Pokhara cleaner, safer, and smarter.
              Registration is free and takes less than 2 minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="h-14 px-8 bg-background text-primary font-bold rounded-md hover:bg-background/90 transition-colors shadow-xl">
                Create Citizen Account
              </button>
              <button className="h-14 px-8 bg-primary-foreground/10 border-2 border-primary-foreground/30 text-primary-foreground font-bold rounded-md hover:bg-primary-foreground/20 transition-colors backdrop-blur-sm">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};