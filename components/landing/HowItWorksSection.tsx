// src/components/landing/HowItWorksSection.tsx
"use client";

import React from "react";
import { Smartphone, FileText, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: Smartphone,
    title: "Snap & Report",
    description: "Take a photo of the issue and upload it with precise GPS location via our mobile-responsive portal.",
  },
  {
    icon: FileText,
    title: "Automatic Routing",
    description: "Our system instantly identifies the location and routes your report to the specific Ward Officer.",
  },
  {
    icon: CheckCircle2,
    title: "Get Resolved",
    description: "Receive real-time SMS and email notifications when the municipal work is completed.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container-gov">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-secondary font-bold tracking-wider uppercase text-sm">
            Simple Process
          </span>
          <h2 className="text-4xl font-heading font-bold mt-2 text-foreground">
            How It Works
          </h2>
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection Line (Desktop Only) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-muted" />
          
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Icon */}
              <div className="h-20 w-20 rounded-2xl bg-card flex items-center justify-center mb-6 shadow-sm border border-border group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              
              {/* Content */}
              <h3 className="font-bold text-xl mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};