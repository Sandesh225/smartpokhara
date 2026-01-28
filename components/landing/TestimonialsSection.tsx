// src/components/landing/TestimonialsSection.tsx
"use client";

import React from "react";
import { Heart, Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "I reported a pothole near my house in Ward 12 and it was fixed within 48 hours. This platform actually works!",
    author: "Ramesh K.",
    role: "Resident",
    location: "Ward 12",
    rating: 5,
    avatar: "RK",
  },
  {
    quote:
      "Paying my property tax online saved me hours of waiting in line. The process was simple, secure, and instant.",
    author: "Sunita M.",
    role: "Business Owner",
    location: "Lakeside",
    rating: 5,
    avatar: "SM",
  },
  {
    quote:
      "The transparency in tracking complaint status is amazing. I always know exactly what is happening with my request.",
    author: "Bikash T.",
    role: "Ward 7 Resident",
    location: "Ward 7",
    rating: 5,
    avatar: "BT",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-background dark:bg-background transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/10 dark:bg-secondary/20 mb-6 sm:mb-8">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-secondary dark:text-secondary/90 fill-current" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground dark:text-foreground/95 mb-4 sm:mb-6 px-4">
            Real Stories, Real Impact
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-2xl mx-auto px-4">
            Hear from citizens who are already making a difference in their
            communities
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl sm:rounded-3xl bg-card dark:bg-card/80 border border-border dark:border-border/50 p-6 sm:p-8 shadow-lg hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Quote Icon Background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 dark:opacity-10 transform translate-x-8 -translate-y-8 text-primary dark:text-primary/80">
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
                  {/* Avatar */}
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-secondary dark:from-primary/80 dark:to-secondary/80 flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-md">
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

              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 bg-muted/50 dark:bg-muted/30 rounded-2xl border border-border dark:border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["RK", "SM", "BT", "DL"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary dark:from-primary/80 dark:to-secondary/80 border-2 border-background dark:border-card flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-bold"
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