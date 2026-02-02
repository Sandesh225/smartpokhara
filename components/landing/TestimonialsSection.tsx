"use client";

import React from "react";
import { Heart, Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

export const TestimonialsSection = () => {
  return (
    /* Adjusted vertical margins: py-8 sm:py-12 md:py-16 */
    <section className="py-8 sm:py-12 md:py-16 bg-background dark:bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header - Compact Margins */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/10 dark:bg-secondary/20 mb-6">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-secondary dark:text-secondary/90 fill-current" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-foreground/95 mb-4">
            Real Stories, Real Impact
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-2xl mx-auto">
            Hear from citizens who are already making a difference in their
            communities
          </p>
        </div>

        {/* Testimonials Grid - Using Shared Constants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl sm:rounded-3xl bg-card dark:bg-card/80 border border-border dark:border-border/50 p-6 sm:p-8 shadow-lg hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Quote Icon Background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-10 transform translate-x-8 -translate-y-8 text-primary">
                <Quote className="w-full h-full" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Star Rating */}
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-sm sm:text-base md:text-lg text-foreground dark:text-foreground/95 italic mb-6 sm:mb-8 leading-relaxed min-h-[80px] sm:min-h-[100px]">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  {/* Avatar Circle */}
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-secondary dark:from-primary/80 dark:to-secondary/80 flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base sm:text-lg text-foreground dark:text-foreground/95 truncate">
                      {testimonial.author}
                    </p>
                    <p className="text-xs sm:text-sm text-secondary dark:text-secondary/90 font-semibold uppercase tracking-wider">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground/80 mt-0.5">
                      📍 {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Background Accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Trust Badge - Compact Spacing */}
        <div className="mt-10 sm:mt-14 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 bg-muted/50 dark:bg-muted/30 rounded-2xl border border-border dark:border-border/50 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["RK", "SM", "BT", "DL"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary dark:from-primary/80 dark:to-secondary/80 border-2 border-background dark:border-card flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-bold shadow-sm"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground/95">
                250k+
              </div>
            </div>
            <div className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 text-center sm:text-left">
              <span className="font-semibold text-foreground dark:text-foreground/95">
                Happy citizens
              </span>{" "}
              trust Smart Pokhara
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
