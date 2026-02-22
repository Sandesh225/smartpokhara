"use client";

import React from "react";
import { MountainSnow, ArrowRight } from "lucide-react";
import { BEAUTY_IMAGES } from "@/lib/constants";

export function BeautySection() {
  // Double the images for a seamless, infinite loop
  const marqueeImages = [...(BEAUTY_IMAGES as any), ...(BEAUTY_IMAGES as any)];

  return (
    <section className="relative py-24 bg-background overflow-hidden transition-colors duration-400">
      {/* Inline styles for the marquee since it wasn't added to the tailwind.config.ts. 
        We use GPU acceleration (translate3d) for smoother rendering.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(-50% - 12px), 0, 0); }
        }
        .animate-marquee-infinite {
          animation: marquee 45s linear infinite;
          will-change: transform;
        }
        .pause-hover:hover .animate-marquee-infinite {
          animation-play-state: paused;
        }
      `,
        }}
      />

      {/* Ambient Background Glows using theme accent and secondary colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/10 dark:bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 dark:bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-20 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent dark:bg-accent/50 border border-primary/10 dark:border-primary/20 text-primary dark:text-primary mb-6 shadow-sm transition-transform hover:scale-102 cursor-default">
          <MountainSnow className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">
            Our Pride
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-foreground mb-6 tracking-tight">
          The City We <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Protect Together</span>
        </h2>

        <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-sans">
          From the serene Phewa Lake to the majestic Himalayan peaks, every
          corner of Pokhara deserves our care and dedication.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden pause-hover group animate-slide-in-from-bottom-2">
        {/* Soft edge fade masks utilizing the dynamic background color */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <div className="flex animate-marquee-infinite gap-6 pl-6 w-max items-center">
          {marqueeImages.map((img, idx) => (
            <div
              key={`${idx}-${img.caption}`}
              className="relative w-[300px] md:w-[420px] aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group/card shadow-lg hover:shadow-xl border border-border transition-all duration-400 hover:-translate-y-2 bg-card"
            >
              {/* Image with zoom effect */}
              <img
                src={img.src}
                alt={img.alt || img.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
              />

              {/* Glassmorphic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity duration-400" />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-400">
                <div className="flex justify-between items-end gap-4">
                  <div>
                    <p className="text-white font-heading font-bold text-xl md:text-2xl mb-3 drop-shadow-md leading-tight">
                      {img.caption}
                    </p>
                    {/* Animated Underline */}
                    <div className="h-1 w-8 bg-primary rounded-full group-hover/card:w-16 transition-all duration-500 ease-out" />
                  </div>
                  
                  {/* Hover Icon Indicator */}
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-400 delay-100 shrink-0">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}