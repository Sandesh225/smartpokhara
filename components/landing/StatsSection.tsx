// src/components/landing/StatsSection.tsx
"use client";

import React from "react";
import { Building2, Activity, CheckCircle2, ShieldCheck } from "lucide-react";

const STATS = [
  {
    number: "33",
    label: "Wards Connected",
    icon: Building2,
    description: "Complete coverage",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "24h",
    label: "Avg. Response",
    icon: Activity,
    description: "Fast resolution",
    color: "from-green-500 to-emerald-500",
  },
  {
    number: "500+",
    label: "Issues Resolved",
    icon: CheckCircle2,
    description: "And counting",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "100%",
    label: "Verified Citizens",
    icon: ShieldCheck,
    description: "Secure platform",
    color: "from-orange-500 to-red-500",
  },
];

export const StatsSection = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-primary dark:bg-primary/95 text-primary-foreground overflow-hidden transition-colors">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]" />
      </div>

      {/* Floating Blurs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6">
            Making an Impact Together
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 dark:text-primary-foreground/70 max-w-2xl mx-auto px-4">
            Real numbers from real citizens creating real change in our city
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {STATS.map((stat, idx) => (
            <div key={idx} className="group relative">
              {/* Card */}
              <div className="h-full text-center p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-primary-foreground/5 dark:bg-primary-foreground/10 border border-primary-foreground/10 dark:border-primary-foreground/20 hover:bg-primary-foreground/10 dark:hover:bg-primary-foreground/15 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg relative overflow-hidden">
                {/* Gradient Overlay on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary-foreground/10 dark:bg-primary-foreground/20 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground/90 dark:text-primary-foreground/80" />
                  </div>

                  {/* Number */}
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-2 sm:mb-3 font-heading tracking-tight leading-none">
                    {stat.number}
                  </div>

                  {/* Label */}
                  <div className="text-xs sm:text-sm md:text-base font-bold text-primary-foreground/80 dark:text-primary-foreground/70 uppercase tracking-widest mb-1 sm:mb-2">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <div className="text-xs sm:text-sm text-primary-foreground/60 dark:text-primary-foreground/50">
                    {stat.description}
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-foreground/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-sm sm:text-base md:text-lg text-primary-foreground/70 dark:text-primary-foreground/60 px-4">
            Join thousands of citizens making Pokhara a better place to live
          </p>
        </div>
      </div>
    </section>
  );
};