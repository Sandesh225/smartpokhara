// src/components/landing/BeautySection.tsx
"use client";

import React from "react";
import { MountainSnow } from "lucide-react";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1652788608087-e8f766b0a93e?q=80&w=1074&auto=format&fit=crop",
    caption: "Phewa Lake Serenity",
  },
  {
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
    caption: "Machhapuchhre Range",
  },
  {
    src: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
    caption: "World Peace Pagoda",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
    caption: "Sarangkot Sunrise",
  },
  {
    src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop",
    caption: "The Vibrant Valley",
  },
];

export function BeautySection() {
  // Double the images for a seamless loop
  const marqueeImages = [...IMAGES, ...IMAGES];

  return (
    <section className="relative py-24 bg-primary dark:bg-primary/95 overflow-hidden transition-colors">
      {/* Optimized Animation Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); }
        }
        .animate-marquee-infinite {
          animation: marquee 40s linear infinite;
          will-change: transform;
        }
        .pause-hover:hover .animate-marquee-infinite {
          animation-play-state: paused;
        }
      `,
        }}
      />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white dark:bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white dark:bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-white/80 dark:text-white/70 mb-4 text-sm font-bold uppercase tracking-[0.2em]">
          <MountainSnow className="w-5 h-5" />
          <span>Our Pride</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          The City We Protect Together
        </h2>

        {/* Description */}
        <p className="text-white/85 dark:text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
          From the serene Phewa Lake to the majestic Himalayan peaks, every
          corner of Pokhara deserves our care.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden pause-hover group">
        {/* Soft edge fading */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-primary dark:from-primary/95 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-primary dark:from-primary/95 to-transparent z-20 pointer-events-none" />

        <div className="flex animate-marquee-infinite gap-6 pl-6 w-max">
          {marqueeImages.map((img, idx) => (
            <div
              key={`${idx}-${img.caption}`}
              className="relative w-[320px] md:w-[450px] aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer group/card shadow-2xl border border-white/10 dark:border-white/5"
            >
              <img
                src={img.src}
                alt={img.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity" />

              {/* Card Content */}
              <div className="absolute bottom-0 left-0 p-8 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                <p className="text-white font-bold text-xl md:text-2xl mb-2 italic drop-shadow-lg">
                  {img.caption}
                </p>
                <div className="h-1 w-0 bg-secondary dark:bg-secondary/90 rounded-full group-hover/card:w-12 transition-all duration-500" />
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 dark:from-secondary/30 via-transparent to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background dark:from-background/95 to-transparent pointer-events-none" />
    </section>
  );
}
