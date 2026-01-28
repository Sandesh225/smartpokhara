// src/components/landing/HeroSection.tsx
"use client";

import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Activity,
  Sparkles,
} from "lucide-react";

const TRUST_INDICATORS = [
  {
    icon: ShieldCheck,
    label: "Gov Verified",
    color: "text-secondary dark:text-secondary/90",
  },
  {
    icon: Users,
    label: "250k+ Citizens",
    color: "text-primary dark:text-primary/90",
  },
  {
    icon: Activity,
    label: "Real-time Data",
    color: "text-secondary dark:text-secondary/90",
  },
];

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-6 sm:py-10 md:py-12 lg:py-19 xl:py-20 bg-background dark:bg-background transition-colors">
      {/* Animated Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(43,95,117,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(43,95,117,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(79,209,197,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,209,197,0.03)_1px,transparent_1px)] bg-[size:24px_24px] sm:bg-[size:32px_32px]" />

      {/* Gradient Blur Effects */}
      <div className="absolute left-1/4 top-0 -z-10 h-[200px] w-[200px] sm:h-[250px] sm:w-[250px] md:h-[310px] md:w-[310px] rounded-full bg-primary/10 dark:bg-primary/20 blur-[80px] md:blur-[100px] animate-pulse" />
      <div
        className="absolute right-1/4 bottom-0 -z-10 h-[200px] w-[200px] sm:h-[250px] sm:w-[250px] md:h-[310px] md:w-[310px] rounded-full bg-secondary/10 dark:bg-secondary/20 blur-[80px] md:blur-[100px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center rounded-full border border-secondary/20 dark:border-secondary/30 bg-secondary/10 dark:bg-secondary/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-secondary dark:text-secondary/90 mb-6 sm:mb-8 transition-all hover:bg-secondary/20 dark:hover:bg-secondary/30 hover:scale-105 cursor-default shadow-sm">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-secondary dark:bg-secondary/90 mr-2 animate-pulse" />
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">
              Digital Services Live in All 33 Wards
            </span>
            <span className="sm:hidden">33 Wards Connected</span>
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto max-w-5xl font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground dark:text-foreground/95 mb-4 sm:mb-6 leading-tight">
            A Smarter City Starts <br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">
              With{" "}
              <span className="relative inline-block">
                <span className="text-primary dark:text-primary/90">
                  Your Voice
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 sm:h-4"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C60 4 140 4 198 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-secondary dark:text-secondary/70"
                  />
                </svg>
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/90 mb-8 sm:mb-10 md:mb-12 leading-relaxed px-4">
            The official platform for Pokhara Metropolitan City. Report
            infrastructure issues, pay taxes securely, and track municipal
            projects with complete transparency.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20 px-4 sm:px-0">
            <button className="group relative h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold bg-primary dark:bg-primary/90 text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary rounded-full shadow-lg shadow-primary/20 dark:shadow-primary/30 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Report an Issue
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-brand-light to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold border-2 border-border dark:border-border/50 text-foreground dark:text-foreground/90 bg-background/50 dark:bg-card/50 backdrop-blur hover:bg-accent dark:hover:bg-accent/80 hover:border-primary dark:hover:border-primary/70 rounded-full transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              Track Application
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-4">
            {TRUST_INDICATORS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full border border-border dark:border-border/50 bg-card/50 dark:bg-card/60 px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm backdrop-blur hover:shadow-md hover:scale-105 transition-all duration-200"
              >
                <item.icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${item.color}`}
                />
                <span className="text-xs sm:text-sm font-semibold text-foreground dark:text-foreground/90 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background dark:from-background/50 to-transparent pointer-events-none" />
    </section>
  );
};