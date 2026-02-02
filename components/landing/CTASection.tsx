"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    /* Changed margins/padding: py-8 sm:py-12 md:py-16 */
    <section className="py-8 sm:py-12 md:py-16 bg-background dark:bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative bg-gradient-to-r from-primary to-secondary dark:from-primary/90 dark:to-secondary/90 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-primary-foreground shadow-2xl overflow-hidden">
          {/* Decorative Blurs - Kept exactly as provided */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to improve your neighborhood?
            </h2>

            <p className="text-primary-foreground/90 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
              Join your neighbors in making Pokhara cleaner, safer, and smarter.
              Registration is free and takes less than 2 minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button className="group h-12 sm:h-14 px-6 sm:px-8 bg-background text-primary font-bold rounded-full hover:bg-background/90 transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2">
                Create Citizen Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="h-12 sm:h-14 px-6 sm:px-8 bg-primary-foreground/10 border-2 border-primary-foreground/30 text-primary-foreground font-bold rounded-full hover:bg-primary-foreground/20 transition-all backdrop-blur-sm hover:scale-105">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
