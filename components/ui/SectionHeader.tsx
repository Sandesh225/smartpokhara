// src/components/ui/SectionHeader.tsx
import React, { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: ReactNode;
  alignment?: 'left' | 'center';
}

export const SectionHeader = ({ 
  title, 
  subtitle, 
  alignment = 'center' 
}: SectionHeaderProps) => (
  <div className={`mb-16 max-w-3xl ${alignment === 'center' ? 'mx-auto text-center' : ''}`}>
    <h2 className="text-4xl font-heading font-bold mb-6 text-foreground tracking-tight">
      {title}
    </h2>
    {subtitle && (
      <div className="text-lg text-muted-foreground leading-relaxed">
        {subtitle}
      </div>
    )}
  </div>
);
