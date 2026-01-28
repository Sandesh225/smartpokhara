// src/components/landing/HowItWorksSection.tsx
"use client";

import React from "react";
import { Smartphone, FileText, CheckCircle2, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Smartphone,
    title: "Snap & Report",
    description:
      "Take a photo of the issue and upload it with precise GPS location via our mobile-responsive portal.",
    color:
      "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    number: "01",
  },
  {
    icon: FileText,
    title: "Automatic Routing",
    description:
      "Our system instantly identifies the location and routes your report to the specific Ward Officer.",
    color:
      "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    number: "02",
  },
  {
    icon: CheckCircle2,
    title: "Get Resolved",
    description:
      "Receive real-time SMS and email notifications when the municipal work is completed.",
    color:
      "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    number: "03",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-background dark:bg-background transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <span className="inline-block text-secondary dark:text-secondary/90 font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 px-4 py-1.5 bg-secondary/10 dark:bg-secondary/20 rounded-full">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-2 text-foreground dark:text-foreground/95 px-4">
            How It Works
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground dark:text-muted-foreground/90 max-w-2xl mx-auto px-4">
            Three simple steps to make your voice heard and improve your
            community
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative">
          {/* Connection Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 lg:top-14 left-[16%] right-[16%] h-0.5 bg-border dark:bg-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-50 dark:opacity-70" />
          </div>

          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 group">
              {/* Card */}
              <div className="h-full flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card dark:bg-card/80 border border-border dark:border-border/50 shadow-sm hover:shadow-xl dark:hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary dark:bg-primary/90 text-primary-foreground font-bold text-lg sm:text-xl flex items-center justify-center shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-all duration-300 relative overflow-hidden`}
                >
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <h3 className="font-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-foreground dark:text-foreground/95">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow (Mobile Only) */}
                {idx < STEPS.length - 1 && (
                  <ArrowRight className="md:hidden w-6 h-6 text-primary dark:text-primary/80 mt-6 animate-bounce" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-muted dark:bg-muted/80 hover:bg-accent dark:hover:bg-accent/80 text-foreground dark:text-foreground/95 font-semibold rounded-full transition-all hover:scale-105 shadow-sm hover:shadow-md text-sm sm:text-base">
            Learn More About Our Process
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};