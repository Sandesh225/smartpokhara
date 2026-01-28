// src/components/landing/FeaturesSection.tsx
"use client";

import React from "react";
import {
  MapPin,
  CreditCard,
  Bell,
  Building2,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const FEATURE_GROUPS = [
  {
    title: "Citizen Services",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
    items: [
      {
        icon: MapPin,
        title: "Geo-Tagged Reporting",
        description:
          "Pinpoint exact locations with GPS technology for accurate issue resolution.",
      },
      {
        icon: CreditCard,
        title: "Digital Tax Payment",
        description:
          "Pay taxes securely online with multiple payment options available 24/7.",
      },
      {
        icon: Bell,
        title: "Status Alerts",
        description:
          "Receive instant SMS & email updates on all your service requests.",
      },
    ],
  },
  {
    title: "City Transparency",
    icon: Building2,
    gradient: "from-purple-500 to-pink-500",
    items: [
      {
        icon: Building2,
        title: "Ward Profiles",
        description:
          "Access complete contact details for all ward representatives and offices.",
      },
      {
        icon: Info,
        title: "Public Notices",
        description:
          "Stay informed with official announcements, alerts, and city updates.",
      },
      {
        icon: CheckCircle2,
        title: "Performance Tracker",
        description:
          "Monitor real-time resolution statistics and municipal performance metrics.",
      },
    ],
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-muted/30 dark:bg-muted/10 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <span className="inline-block text-primary dark:text-primary/90 font-bold tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 px-4 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
            Comprehensive Platform
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground dark:text-foreground/95 mb-4 sm:mb-6 px-4">
            Everything You Need to Connect
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl mx-auto px-4">
            Smart Pokhara bridges the gap between citizens and local government
            with transparency and efficiency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {FEATURE_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-card dark:bg-card/80 border border-border dark:border-border/50 p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Background Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${group.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`}
              />

              {/* Group Header */}
              <div className="relative flex items-center gap-4 mb-8 sm:mb-10">
                <div
                  className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${group.gradient} flex items-center justify-center shadow-lg`}
                >
                  <group.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-foreground/95">
                    {group.title}
                  </h3>
                  <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-primary to-secondary dark:from-primary/80 dark:to-secondary/80 rounded-full mt-2" />
                </div>
              </div>

              {/* Features List */}
              <div className="relative space-y-5 sm:space-y-6">
                {group.items.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 group/item"
                  >
                    {/* Icon */}
                    <div className="shrink-0 h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary/90 flex items-center justify-center group-hover/item:bg-primary dark:group-hover/item:bg-primary/90 group-hover/item:text-primary-foreground group-hover/item:scale-110 transition-all duration-200 shadow-sm">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-foreground dark:text-foreground/95 group-hover/item:text-primary dark:group-hover/item:text-primary/90 transition-colors mb-1 sm:mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 md:mt-20">
          <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/90 mb-4 sm:mb-6 px-4">
            Ready to experience seamless civic engagement?
          </p>
          <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary dark:bg-primary/90 hover:bg-primary/90 dark:hover:bg-primary text-primary-foreground font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base">
            Explore All Features
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};