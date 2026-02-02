"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export const HowItWorksSection = () => {
  return (
    /* Adjusted vertical margins/padding: py-8 sm:py-12 md:py-16 */
    <section className="py-8 sm:py-12 md:py-16 bg-background dark:bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header - Margin tightened */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-secondary dark:text-secondary/90 font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 px-4 py-1.5 bg-secondary/10 dark:bg-secondary/20 rounded-full">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground/95 mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground/90 max-w-2xl mx-auto">
            Three simple steps to make your voice heard and improve your
            community
          </p>
        </div>

        {/* Steps Grid - Pulling from Constants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
          {/* Connection Line (Desktop) - UI Preserved */}
          <div className="hidden md:block absolute top-12 lg:top-14 left-[16%] right-[16%] h-0.5 bg-border dark:bg-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-50 dark:opacity-70" />
          </div>

          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 group">
              <div className="h-full flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card dark:bg-card/80 border border-border dark:border-border/50 shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary dark:bg-primary/90 text-primary-foreground font-bold text-lg sm:text-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  {step.number}
                </div>

                {/* Icon Container */}
                <div
                  className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-all duration-300`}
                >
                  <step.icon className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl sm:text-2xl mb-3 text-foreground dark:text-foreground/95 transition-colors group-hover:text-primary dark:group-hover:text-primary/90">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow (Mobile Only) */}
                {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="md:hidden mt-6">
                    <ArrowRight className="w-6 h-6 text-primary dark:text-primary/80 animate-bounce rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA - Tightened Margin */}
        <div className="text-center mt-10 sm:mt-12">
          <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground font-semibold rounded-full transition-all hover:scale-105 shadow-sm hover:shadow-md">
            Learn More About Our Process
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
