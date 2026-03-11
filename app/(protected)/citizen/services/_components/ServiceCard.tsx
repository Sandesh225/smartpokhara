"use client";

import { LucideIcon, ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  available?: boolean;
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  available = true,
}: ServiceCardProps) {
  const Wrapper = available ? Link : "div";
  const wrapperProps = available ? { href } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={cn(
        "group relative flex flex-col gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-200 outline-none overflow-hidden",
        "bg-card shadow-xs",
        available
          ? "border-border hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          : "border-border/50 opacity-60 cursor-default"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      {available && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_60%)] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 border",
            available
              ? "bg-muted border-border/50 text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
              : "bg-muted/50 border-border/30 text-muted-foreground"
          )}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>

        {available ? (
          <ArrowUpRight
            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200"
            aria-hidden="true"
          />
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" /> Soon
          </span>
        )}
      </div>

      <div className="relative z-10 space-y-1">
        <h3
          className={cn(
            "text-sm font-semibold tracking-tight transition-colors duration-200",
            available
              ? "text-foreground group-hover:text-primary"
              : "text-muted-foreground"
          )}
        >
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </Wrapper>
  );
}
