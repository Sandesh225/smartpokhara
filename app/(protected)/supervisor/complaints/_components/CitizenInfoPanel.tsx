"use client";

import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Shield,
  MessageSquare,
  History,
  Fingerprint,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CitizenInfoPanelProps {
  citizen: any;
  isAnonymous?: boolean;
}

export function CitizenInfoPanel({
  citizen,
  isAnonymous,
}: CitizenInfoPanelProps) {
  // 1. Fix Hydration: State to track if component is mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     ANONYMOUS STATE (Glass Context)
     ═══════════════════════════════════════════════════════════ */
  if (isAnonymous) {
    return (
      <div className="glass-strong border-white/40 p-8 text-center rounded-[var(--radius)] elevation-2">
        <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white shadow-inner">
          <Fingerprint className="w-8 h-8 text-highlight-tech" />
        </div>
        <h4 className="font-sans font-bold text-text-ink tracking-tight text-lg">
          Identity Redacted
        </h4>
        <p className="text-xs text-neutral-stone-600 mt-2 leading-relaxed max-w-[220px] mx-auto">
          The reporter has chosen to remain anonymous for this case. Contact
          details and profile data are restricted.
        </p>
      </div>
    );
  }

  const displayName = citizen?.full_name || "Unknown Citizen";
  const displayEmail = citizen?.email || "No email";
  const displayPhone = citizen?.phone || "No phone";
  const hasContact = !!(citizen?.email || citizen?.phone);

  // 2. Fix Hydration: Derive a STABLE ID from citizen data instead of Math.random()
  const citizenShortId = citizen?.id
    ? citizen.id.toString().substring(0, 6).toUpperCase()
    : "STABLE-ID";

  /* ═══════════════════════════════════════════════════════════
     VERIFIED STATE (Stone Foundation)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="stone-card overflow-hidden transition-all duration-300 hover:border-primary-brand/30">
      {/* Header Section */}
      <div className="px-6 py-4 bg-neutral-stone-50 border-b border-neutral-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary-brand" />
          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-stone-600">
            Citizen Profile
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success-green/10 text-success-green rounded-full border border-success-green/20">
          <Shield className="w-3 h-3" />
          <span className="text-[9px] font-bold uppercase">Verified</span>
        </div>
      </div>

      {/* Profile Bio */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-14 w-14 border-2 border-white shadow-md elevation-2">
            <AvatarImage src={citizen?.avatar_url} />
            <AvatarFallback className="bg-primary-brand text-white font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-sans font-bold text-text-ink truncate text-base tracking-tight">
              {displayName}
            </h4>
            {/* 3. Fix Hydration: Use the stable derived ID */}
            <p className="text-[10px] text-neutral-stone-500 font-mono font-bold uppercase tracking-tighter">
              ID: POKR-{citizenShortId}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-neutral-stone-50 rounded-xl border border-neutral-stone-200/60 group hover:bg-white hover:border-accent-nature transition-all">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-brand border border-neutral-stone-200 group-hover:text-accent-nature">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-neutral-stone-400 font-black uppercase tracking-tighter">
                Primary Email
              </p>
              <p className="text-xs font-semibold text-text-ink truncate">
                {displayEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-stone-50 rounded-xl border border-neutral-stone-200/60 group hover:bg-white hover:border-accent-nature transition-all">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-brand border border-neutral-stone-200 group-hover:text-accent-nature">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-neutral-stone-400 font-black uppercase tracking-tighter">
                Contact Number
              </p>
              <p className="text-xs font-semibold text-text-ink">
                {displayPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="sm"
            className="w-full text-[11px] font-bold h-10 bg-primary-brand hover:bg-primary-brand-light text-white rounded-xl elevation-2 transition-transform active:scale-95"
            disabled={!hasContact}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-2" />
            Direct Msg
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[11px] font-bold h-10 border-neutral-stone-200 text-neutral-stone-600 hover:bg-neutral-stone-100 rounded-xl transition-all"
          >
            <History className="w-3.5 h-3.5 mr-2" />
            Logs
          </Button>
        </div>
      </div>
    </div>
  );
}