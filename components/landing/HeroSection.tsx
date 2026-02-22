"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { TRUST_INDICATORS } from "@/lib/constants";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-8 sm:py-12 md:py-24 lg:py-20 bg-background">

      {/* ── Ambient blobs ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* top-left: primary teal */}
        <div className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full bg-primary/8 dark:bg-primary/12 blur-[90px] animate-pulse" />
        {/* bottom-right: secondary soft teal */}
        <div
          className="absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full bg-secondary/8 dark:bg-secondary/12 blur-[90px] animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
        {/* center accent: glacier highlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent/40 dark:bg-accent/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">

          {/* ── Status badge ───────────────────────────────────────── */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-4 py-2 shadow-sm transition-all hover:shadow-md hover:border-secondary/40">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse flex-shrink-0" />
            <Sparkles className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              Digital Services Live in All 33 Wards
            </span>
            <span className="text-xs font-semibold text-foreground sm:hidden">
              33 Wards Connected
            </span>
          </div>

          {/* ── Headline ───────────────────────────────────────────── */}
          <h1 className="mx-auto max-w-4xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1] mb-6
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            A Smarter City Starts
            <br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0"> With </span>
            <span className="relative inline-block ml-2">
              <span className="text-primary">Your Voice</span>
              {/* underline SVG using secondary color */}
              <svg
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 10C60 4 140 4 198 10"
                  stroke="rgb(95,158,160)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* ── Sub-headline ───────────────────────────────────────── */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 sm:mb-12 px-2">
            The official platform for Pokhara Metropolitan City. Report
            infrastructure issues, pay taxes securely, and track municipal
            projects with complete transparency.
          </p>

          {/* ── CTAs ───────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-16 sm:mb-20 w-full px-4 sm:px-0 sm:w-auto">

            {/* Primary */}
            <Link
              href="/citizen/complaints/new"
              aria-label="Report an issue to the municipality"
              className="group relative inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-7 sm:px-9 rounded-full font-bold text-sm sm:text-base
                bg-primary text-primary-foreground
                shadow-[0_4px_14px_-2px_rgba(43,95,117,0.35)]
                hover:opacity-90 hover:shadow-[0_6px_20px_-2px_rgba(43,95,117,0.45)] hover:-translate-y-0.5
                dark:shadow-[0_4px_14px_-2px_rgba(79,209,197,0.25)]
                dark:hover:shadow-[0_6px_20px_-2px_rgba(79,209,197,0.35)]
                transition-all duration-300 active:scale-95"
            >
              Report an Issue
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
            </Link>

            {/* Secondary */}
            <Link
              href="/citizen/complaints"
              aria-label="Track your application status"
              className="inline-flex items-center justify-center h-12 sm:h-14 px-7 sm:px-9 rounded-full font-bold text-sm sm:text-base
                border-2 border-border bg-card/60 backdrop-blur-sm text-foreground
                hover:border-primary/50 hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5
                transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
            >
              Track Application
            </Link>
          </div>

          {/* ── Trust indicators ───────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-4">
            {TRUST_INDICATORS.map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm
                  px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm
                  hover:shadow-md hover:border-border/80 hover:-translate-y-0.5
                  transition-all duration-200"
              >
                <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${item.color}`} aria-hidden="true" />
                <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Bottom fade into next section ─────────────────────────── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};