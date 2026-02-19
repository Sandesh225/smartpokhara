"use client";

import { ShieldCheck, Database, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "flowbite-react";

export function JurisdictionCard({ jurisdiction }: { jurisdiction: any }) {
  return (
    <div className="relative group overflow-hidden rounded-3xl bg-primary/5 border border-primary/20 p-6 interactive-card shadow-sm">
      <div className="absolute -top-4 -right-4 p-2 opacity-5 group-hover:opacity-10 transition-opacity duration-700 rotate-12">
        <ShieldCheck size={120} className="text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">
            Clearance Verified
          </span>
        </div>

        <p className="text-sm font-bold text-foreground leading-tight dark:text-glow">
          {jurisdiction?.is_senior
            ? "Metropolitan General Ledger"
            : "District Scoped Node"}
        </p>
        <p className="text-[10px] font-medium text-muted-foreground mt-1">
          Active Node: {jurisdiction?.node || "Identifying..."}
        </p>

        <div className="mt-5 pt-4 border-t border-primary/10 flex justify-between items-center">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Last Sync
          </span>
          <span className="text-[10px] font-mono font-bold text-primary">
            {jurisdiction?.lastSync || "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
          Decrypting Ledger
        </p>
        <p className="text-[9px] text-muted-foreground mt-2 animate-pulse">
          Establishing Secure Handshake with Pokhara Node...
        </p>
      </div>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
      <div className="h-20 w-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 border border-destructive/20 shadow-2xl text-destructive">
        <AlertCircle size={40} />
      </div>
      <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
        Access Restricted
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-3 mb-8 leading-relaxed">
        {error}
      </p>
      <Button
        onClick={onRetry}
        className="bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl accent-glow border-none px-6"
      >
        <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Reconnect Terminal
      </Button>
    </div>
  );
}
