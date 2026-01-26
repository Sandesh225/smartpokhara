// src/components/landing/FeaturesSection.tsx
"use client";

import React from "react";
import { MapPin, CreditCard, Bell, Building2, Info, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FEATURE_GROUPS = [
  {
    title: "Citizen Services",
    items: [
      {
        icon: MapPin,
        title: "Geo-Tagged Reporting",
        description: "Pinpoint exact locations with GPS.",
      },
      {
        icon: CreditCard,
        title: "Digital Tax Payment",
        description: "Pay taxes securely online.",
      },
      {
        icon: Bell,
        title: "Status Alerts",
        description: "SMS & Email updates on requests.",
      },
    ],
  },
  {
    title: "City Transparency",
    items: [
      {
        icon: Building2,
        title: "Ward Profiles",
        description: "Contact details for representatives.",
      },
      {
        icon: Info,
        title: "Public Notices",
        description: "Official announcements & alerts.",
      },
      {
        icon: CheckCircle2,
        title: "Performance Tracker",
        description: "Real-time resolution statistics.",
      },
    ],
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container-gov">
        <SectionHeader
          title="Everything You Need to Connect"
          subtitle="Smart Pokhara bridges the gap between citizens and local government with transparency and efficiency."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {FEATURE_GROUPS.map((group, idx) => (
            <div key={idx} className="card-gov p-8 bg-card">
              {/* Group Header */}
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-8 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-secondary rounded-full" />
                {group.title}
              </h3>
              
              {/* Features List */}
              <div className="space-y-6">
                {group.items.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-4 group">
                    {/* Icon */}
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};