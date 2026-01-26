// src/components/landing/TestimonialsSection.tsx
"use client";

import React from "react";
import { Heart } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "I reported a pothole near my house in Ward 12 and it was fixed within 48 hours. This platform actually works!",
    author: "Ramesh K.",
    role: "Resident",
  },
  {
    quote: "Paying my property tax online saved me hours of waiting in line. The process was simple, secure, and instant.",
    author: "Sunita M.",
    role: "Business Owner",
  },
  {
    quote: "The transparency in tracking complaint status is amazing. I always know exactly what is happening with my request.",
    author: "Bikash T.",
    role: "Ward 7",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container-gov">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heart className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h2 className="text-4xl font-heading font-bold text-foreground">
            Real Stories, Real Impact
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div
              key={idx}
              className="card-gov p-8 bg-card hover:border-primary/50 transition-colors"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-foreground italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              {/* Author Info */}
              <div>
                <p className="font-bold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-xs text-secondary font-bold uppercase tracking-wider">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};