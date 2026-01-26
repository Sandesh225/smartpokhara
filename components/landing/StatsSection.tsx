// src/components/landing/StatsSection.tsx
"use client";

import React from "react";
import { Building2, Activity, CheckCircle2, ShieldCheck } from "lucide-react";

const STATS = [
  {
    number: "33",
    label: "Wards Connected",
    icon: Building2,
  },
  {
    number: "24h",
    label: "Avg. Response",
    icon: Activity,
  },
  {
    number: "500+",
    label: "Issues Resolved",
    icon: CheckCircle2,
  },
  {
    number: "100%",
    label: "Verified Citizens",
    icon: ShieldCheck,
  },
];

export const StatsSection = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container-gov relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors backdrop-blur-sm"
            >
              {/* Icon */}
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-primary-foreground/90" />
              
              {/* Number */}
              <div className="text-4xl md:text-5xl font-extrabold mb-2 font-heading tracking-tight">
                {stat.number}
              </div>
              
              {/* Label */}
              <div className="text-xs md:text-sm font-medium text-primary-foreground/80 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};