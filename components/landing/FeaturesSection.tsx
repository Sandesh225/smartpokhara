"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { FEATURE_GROUPS } from "@/lib/constants";

export const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-muted/40 transition-colors duration-400">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <span className="inline-block text-primary font-heading font-bold tracking-wide uppercase text-xs sm:text-sm mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
            Comprehensive Platform
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-foreground mb-6 tracking-tight">
            Everything You Need to Connect
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-sans text-muted-foreground max-w-3xl mx-auto">
            Smart Pokhara bridges the gap between citizens and local government
            with transparency and efficiency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {FEATURE_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-card border border-border p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 overflow-hidden"
            >
              {/* Note: Ensure group.gradient in your constants uses semantic classes (e.g., 'from-primary to-secondary') */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${group.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              <div className="relative flex items-center gap-5 mb-8 sm:mb-10">
                <div
                  className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shadow-md`}
                >
                  <group.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight">
                    {group.title}
                  </h3>
                  <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-primary to-secondary rounded-full mt-2.5 transition-all duration-500 group-hover:w-full" />
                </div>
              </div>

              <div className="relative space-y-4 sm:space-y-5">
                {group.items.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/60 transition-all duration-300 group/item border border-transparent hover:border-border/50"
                  >
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-primary-foreground group-hover/item:scale-105 transition-all duration-300 shadow-sm">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-base sm:text-lg font-heading font-bold text-foreground group-hover/item:text-primary transition-colors mb-1.5">
                        {feature.title}
                      </h4>
                      <p className="text-sm sm:text-base font-sans text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Blur Circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 animate-fade-in">
          <p className="text-sm sm:text-base font-sans text-muted-foreground mb-5">
            Ready to experience seamless civic engagement?
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 active:scale-95">
            Explore All Features
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};