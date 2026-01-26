// src/components/landing/HeroSection.tsx
"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Users, Activity } from "lucide-react";

const TRUST_INDICATORS = [
  { icon: ShieldCheck, label: "Gov Verified", color: "text-secondary" },
  { icon: Users, label: "250k+ Citizens", color: "text-primary" },
  { icon: Activity, label: "Real-time Data", color: "text-secondary" },
];

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32 bg-background">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(15,65,105,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,65,105,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Gradient Blur Effect */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 blur-[100px]" />

      <div className="container-gov text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-8 transition-colors hover:bg-secondary/20 cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse" />
          Digital Services Live in All 33 Wards
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl font-heading text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6">
          A Smarter City Starts With{" "}
          <br className="hidden sm:block" />
          <span className="text-primary">Your Voice</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
          The official platform for Pokhara Metropolitan City. Report infrastructure 
          issues, pay taxes securely, and track municipal projects with complete transparency.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <button className="btn-gov btn-gov-primary h-12 px-8 text-base shadow-lg shadow-primary/20 w-full sm:w-auto">
            Report an Issue
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <button className="btn-gov btn-gov-outline h-12 px-8 text-base bg-background/50 backdrop-blur w-full sm:w-auto">
            Track Application
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {TRUST_INDICATORS.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 shadow-sm backdrop-blur"
            >
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-sm font-semibold text-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};