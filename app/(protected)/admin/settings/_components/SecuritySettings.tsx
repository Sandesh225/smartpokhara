
// ═══════════════════════════════════════════════════════════
// _components/SecuritySettings.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { updateSystemConfig } from "../actions";
import { Loader2, Shield, Clock, Key, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SecurityConfig {
  require_2fa: boolean;
  session_timeout: number;
  password_expiry: number;
}

export default function SecuritySettings({
  initialData,
}: {
  initialData: SecurityConfig;
}) {
  const [loading, setLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(initialData.require_2fa);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const newData = {
      require_2fa: formData.get("require_2fa") === "on",
      session_timeout: Number(formData.get("session_timeout")),
      password_expiry: Number(formData.get("password_expiry")),
    };

    await updateSystemConfig("security_policy", newData);
    setLoading(false);
  };

  return (
    <form action={handleSubmit} className="stone-card overflow-hidden">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-base md:text-lg text-foreground">
              Security Policy
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Configure authentication and session rules
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-6 space-y-4">
        {/* 2FA TOGGLE */}
        <label className="flex items-center justify-between p-4 border-2 border-border rounded-lg bg-card hover:bg-accent/30 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              twoFAEnabled ? "bg-success-green/10" : "bg-muted"
            )}>
              <Shield className={cn(
                "w-5 h-5",
                twoFAEnabled ? "text-success-green" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-muted-foreground">
                Require 2FA for all admin users
              </p>
            </div>
          </div>
          <input
            name="require_2fa"
            type="checkbox"
            checked={twoFAEnabled}
            onChange={(e) => setTwoFAEnabled(e.target.checked)}
            className="w-5 h-5 accent-primary rounded cursor-pointer"
          />
        </label>

        {/* SESSION & PASSWORD INPUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SESSION TIMEOUT */}
          <div className="space-y-2">
            <label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Session Timeout
            </label>
            <div className="relative">
              <input
                name="session_timeout"
                type="number"
                defaultValue={initialData.session_timeout}
                className="w-full px-3 py-2 pr-16 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                min="5"
                max="120"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                minutes
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Auto-logout inactive users
            </p>
          </div>

          {/* PASSWORD EXPIRY */}
          <div className="space-y-2">
            <label className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3 h-3" />
              Password Expiry
            </label>
            <div className="relative">
              <input
                name="password_expiry"
                type="number"
                defaultValue={initialData.password_expiry}
                className="w-full px-3 py-2 pr-12 border-2 border-border rounded-lg bg-card font-medium text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                min="30"
                max="365"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                days
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Force password reset interval
            </p>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="pt-4 border-t-2 border-border flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="gap-2 font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

