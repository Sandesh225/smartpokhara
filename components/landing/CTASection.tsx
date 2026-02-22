"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background transition-colors duration-400">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative bg-gradient-to-r from-primary to-secondary rounded-[2rem] p-8 sm:p-12 md:p-16 text-center text-primary-foreground shadow-2xl overflow-hidden">
          
          {/* Decorative Ambient Blurs - Swapped arbitrary 'black' for semantic foreground */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-foreground/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-foreground/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
              Ready to improve your neighborhood?
            </h2>

            <p className="text-primary-foreground/90 font-sans text-base sm:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              Join your neighbors in making Pokhara cleaner, safer, and smarter.
              Registration is free and takes less than 2 minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="group h-14 px-8 bg-background text-primary font-heading font-bold rounded-xl hover:bg-muted transition-all duration-300 shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Create Citizen Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="h-14 px-8 bg-primary-foreground/10 border-2 border-primary-foreground/30 text-primary-foreground font-heading font-bold rounded-xl hover:bg-primary-foreground/20 transition-all duration-300 backdrop-blur-sm hover:-translate-y-1">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};