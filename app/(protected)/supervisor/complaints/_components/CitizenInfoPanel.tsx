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
  Copy,
  CheckCircle2,
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

  if (!mounted) return <div className="stone-card h-[380px] animate-pulse bg-neutral-stone-100" />;

  /* ═══════════════════════════════════════════════════════════
      ANONYMOUS STATE (Glass Context)
     ═══════════════════════════════════════════════════════════ */
  if (isAnonymous) {
    return (
      <div className="glass-strong border-white/40 p-10 text-center rounded-3xl elevation-3 relative overflow-hidden group">
        {/* Subtle background tech pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="w-20 h-20 bg-white/60 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white shadow-xl transition-transform group-hover:scale-110 duration-500">
          <Fingerprint className="w-10 h-10 text-highlight-tech" />
        </div>
        <h4 className="font-sans font-black text-text-ink tracking-tight text-xl uppercase">
          Identity Redacted
        </h4>
        <p className="text-[11px] text-neutral-stone-500 mt-3 leading-relaxed max-w-[240px] mx-auto font-medium">
          PROTOCOL 403: The reporter has opted for anonymity. Personal identifiers and metadata are locked by the security layer.
        </p>
      </div>
    );
  }

  const displayName = citizen?.full_name || "Unknown Citizen";
  const displayEmail = citizen?.email || "No email";
  const displayPhone = citizen?.phone || "No phone";
  const hasContact = !!(citizen?.email || citizen?.phone);

  const citizenShortId = citizen?.id
    ? citizen.id.toString().substring(0, 6).toUpperCase()
    : "GUEST";

  /* ═══════════════════════════════════════════════════════════
      VERIFIED STATE (Stone Foundation)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="stone-card overflow-hidden border-none shadow-xl transition-all duration-500 hover:shadow-2xl ring-1 ring-black/5">
      {/* Header with Integrated Verification */}
      <div className="px-6 py-4 bg-neutral-stone-50/80 backdrop-blur-md border-b border-neutral-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-stone-500">
            Citizen Node
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-success-green/10 text-success-green rounded-full border border-success-green/20 shadow-sm">
          <CheckCircle2 className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Verified Identity</span>
        </div>
      </div>

      <div className="p-7">
        {/* Profile Card */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative group">
            <Avatar className="h-16 w-16 border-4 border-white shadow-xl transition-transform group-hover:scale-105 duration-300">
              <AvatarImage src={citizen?.avatar_url} />
              <AvatarFallback className="bg-primary-brand text-white font-black text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-neutral-stone-100">
              <Shield className="w-3.5 h-3.5 text-primary-brand" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-sans font-black text-text-ink truncate text-lg tracking-tight leading-none mb-1">
              {displayName}
            </h4>
            <div className="flex items-center gap-2">
                <span className="text-[9px] bg-neutral-stone-100 px-2 py-0.5 rounded font-mono font-bold text-neutral-stone-500">
                    POKR-{citizenShortId}
                </span>
            </div>
          </div>
        </div>

        {/* Contact Information with Copy Actions */}
        <div className="space-y-3 mb-8">
          {[
            { icon: Mail, label: "Primary Email", value: displayEmail, key: "Email" },
            { icon: Phone, label: "Contact Number", value: displayPhone, key: "Phone" }
          ].map((item) => (
            <div 
              key={item.key}
              onClick={() => copyToClipboard(item.value, item.key)}
              className="flex items-center gap-4 p-4 bg-neutral-stone-50 rounded-2xl border border-neutral-stone-200/50 cursor-pointer hover:bg-white hover:border-primary-brand/30 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-stone-400 border border-neutral-stone-200 group-hover:text-primary-brand transition-colors">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-neutral-stone-400 font-black uppercase tracking-widest mb-0.5">
                  {item.label}
                </p>
                <p className="text-xs font-bold text-text-ink truncate">
                  {item.value}
                </p>
              </div>
              <Copy className="w-3.5 h-3.5 text-neutral-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="w-full text-[11px] font-black uppercase tracking-widest h-12 bg-primary-brand hover:bg-primary-brand-light text-white rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            disabled={!hasContact}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-[11px] font-black uppercase tracking-widest h-12 border-neutral-stone-200 text-neutral-stone-600 hover:bg-neutral-stone-50 rounded-2xl transition-all"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>
    </div>
  );
}