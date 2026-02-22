"use client";

import { useState, useEffect } from "react";
import {
  User, Phone, Mail, Shield, MessageSquare, History,
  Fingerprint, Copy, CheckCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CitizenInfoPanelProps {
  citizen: any;
  isAnonymous?: boolean;
}

export function CitizenInfoPanel({
  citizen,
  isAnonymous,
}: CitizenInfoPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (!mounted) {
    return (
      <div className="stone-card h-[300px] md:h-[380px] animate-pulse bg-muted" />
    );
  }

  /* ═══════════════════════════════════════════════════════════
      ANONYMOUS STATE
     ═══════════════════════════════════════════════════════════ */
  if (isAnonymous) {
    return (
      <div className="bg-card rounded-xl md:rounded-2xl p-6 md:p-10 text-center relative overflow-hidden group border border-border shadow-xs">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]" />
        
        <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 border border-border shadow-sm transition-transform group-hover:scale-110 duration-500">
          <Fingerprint className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
        </div>
        
        <h4 className="font-bold text-foreground text-lg md:text-xl">
          Identity Redacted
        </h4>
        
        <p className="text-xs text-muted-foreground mt-2 md:mt-3 leading-relaxed max-w-[200px] md:max-w-[240px] mx-auto font-medium">
          PROTOCOL 403: The reporter has opted for anonymity. Personal identifiers are locked by the security layer.
        </p>
      </div>
    );
  }

  const displayName = citizen?.profile?.full_name || citizen?.full_name || "Unknown Citizen";
  const displayEmail = citizen?.email || "No email";
  const displayPhone = citizen?.phone || "No phone";
  const hasContact = !!(citizen?.email || citizen?.phone);
  const avatarUrl = citizen?.profile?.profile_photo_url || citizen?.profile_photo_url || citizen?.avatar_url;

  const citizenShortId = citizen?.id
    ? citizen.id.toString().substring(0, 6).toUpperCase()
    : "GUEST";

  /* ═══════════════════════════════════════════════════════════
      VERIFIED STATE
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="bg-card border border-border overflow-hidden rounded-xl shadow-xs transition-all duration-500">
      
      {/* HEADER */}
      <div className="px-4 md:px-6 py-3 bg-muted/20 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-foreground/70" />
          <span className="text-sm font-bold text-foreground">
            Citizen Profile
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-green/10 text-success-green rounded-md border border-success-green/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">
            Verified
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-7">
        
        {/* PROFILE SECTION */}
        <div className="flex items-center gap-3 md:gap-5 mb-6 md:mb-8">
          <div className="relative group shrink-0">
            <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 md:border-4 border-background shadow-xl transition-transform group-hover:scale-105 duration-300">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground font-black text-lg md:text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 bg-background p-0.5 md:p-1 rounded-full shadow-md border border-border">
              <Shield className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-foreground truncate text-base md:text-lg mb-1">
              {displayName}
            </h4>
            <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground inline-block border border-border">
              POKR-{citizenShortId}
            </span>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          {[
            { 
              icon: Mail, 
              label: "Primary Email", 
              value: displayEmail, 
              key: "Email" 
            },
            { 
              icon: Phone, 
              label: "Contact Number", 
              value: displayPhone, 
              key: "Phone" 
            }
          ].map((item) => (
            <div 
              key={item.key}
              onClick={() => copyToClipboard(item.value, item.key)}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-muted rounded-lg md:rounded-xl border border-border cursor-pointer hover:bg-background hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-background flex items-center justify-center text-muted-foreground border border-border group-hover:text-primary transition-colors shrink-0">
                <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-semibold mb-0.5">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {item.value}
                </p>
              </div>
              
              <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <Button
            size="sm"
            className="w-full text-xs md:text-sm font-black uppercase tracking-wider h-10 md:h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg md:rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            disabled={!hasContact}
          >
            <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Message</span>
            <span className="sm:hidden">Msg</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs md:text-sm font-black uppercase tracking-wider h-10 md:h-12 border-border text-muted-foreground hover:bg-muted rounded-lg md:rounded-xl transition-all"
          >
            <History className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">Log</span>
          </Button>
        </div>
      </div>
    </div>
  );
}