// ═══════════════════════════════════════════════════════════
// app/admin/citizens/_components/AccountActions.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, ShieldCheck, KeyRound, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccountActions({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleStatus = async () => {
    if (
      !confirm(
        `Are you sure you want to ${
          isActive ? "suspend" : "activate"
        } this account?`
      )
    )
      return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !isActive })
        .eq("id", userId);

      if (error) throw error;

      toast.success(
        `Account ${isActive ? "suspended" : "activated"} successfully`
      );
      router.refresh();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stone-card p-4 md:p-6">
      <h3 className="font-bold text-sm md:text-base text-foreground mb-4">
        Account Actions
      </h3>
      <div className="space-y-2 md:space-y-3">
        <Button
          onClick={toggleStatus}
          disabled={loading}
          variant="outline"
          className={cn(
            "w-full justify-center gap-2",
            isActive
              ? "border-error-red/30 text-error-red hover:bg-error-red/10"
              : "border-success-green/30 text-success-green hover:bg-success-green/10"
          )}
        >
          {isActive ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          {isActive ? "Suspend Account" : "Activate Account"}
        </Button>

        <Button variant="outline" className="w-full justify-center gap-2">
          <KeyRound className="w-4 h-4" />
          Send Password Reset
        </Button>

        <Button variant="outline" className="w-full justify-center gap-2">
          <UserCog className="w-4 h-4" />
          Promote to Staff
        </Button>
      </div>
    </div>
  );
}
