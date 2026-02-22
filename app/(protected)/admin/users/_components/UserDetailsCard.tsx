"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Shield, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UserDetailsProps {
  user: any;
}

export function UserDetailsCard({ user }: UserDetailsProps) {
  const profile = user.user_profiles;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || !mounted) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString || !mounted) return "Never";
    try {
      return format(new Date(dateString), "PPP 'at' p");
    } catch (error) {
      console.error("DateTime formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <CardHeader className="border-b-2 border-border bg-muted/30 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-base md:text-lg font-black text-foreground tracking-tight">
              Profile Details
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-bold gap-1",
                user.is_active
                  ? "border-success-green/30 bg-success-green/10 text-success-green"
                  : "border-error-red/30 bg-error-red/10 text-error-red"
              )}
            >
              {user.is_active ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Inactive
                </>
              )}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-bold gap-1",
                user.is_verified
                  ? "border-info-blue/30 bg-info-blue/10 text-info-blue"
                  : "border-warning-amber/30 bg-warning-amber/10 text-warning-amber"
              )}
            >
              {user.is_verified ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Unverified
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="grid gap-6 sm:grid-cols-2 p-4 md:p-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4 md:space-y-5">
          <div>
            <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Full Name
            </label>
            <div className="flex items-center gap-2 text-sm md:text-base font-black text-foreground">
              {profile?.full_name || "N/A"}
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              </div>
              <span className="text-sm md:text-base font-medium text-foreground break-all">
                {user.email}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-secondary/10">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
              </div>
              <span className="text-sm md:text-base font-medium text-foreground">
                {user.phone || profile?.phone_number || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 md:space-y-5">
          <div>
            <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Auth Provider
            </label>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-warning-amber/10">
                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-warning-amber" />
              </div>
              <span className="text-sm md:text-base font-medium text-foreground capitalize">
                {user.external_auth_provider || "email"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Joined Date
            </label>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-info-blue/10">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-info-blue" />
              </div>
              {mounted ? (
                <span className="text-sm md:text-base font-medium text-foreground">
                  {formatDate(user.created_at)}
                </span>
              ) : (
                <span className="animate-pulse bg-muted h-5 w-32 rounded" />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Last Login
            </label>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-success-green/10">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-success-green" />
              </div>
              {mounted ? (
                <span className="text-sm md:text-base font-medium text-foreground">
                  {formatDateTime(user.last_login_at)}
                </span>
              ) : (
                <span className="animate-pulse bg-muted h-5 w-40 rounded" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}