// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/settings/system/page.tsx
// ═══════════════════════════════════════════════════════════

import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MaintenanceMode from "../_components/MaintenanceMode";
import SecuritySettings from "../_components/SecuritySettings";
import BackupManager from "../_components/BackupManager";
import { Button } from "@/components/ui/button";

export default async function SystemSettingsPage() {
  const supabase = await createClient();

  const { data: configs } = await supabase
    .from("system_configurations")
    .select("*");

  const getConfig = (key: string) =>
    configs?.find((c) => c.key === key)?.value || {};

  const maintenance = getConfig("maintenance_mode");
  const security = getConfig("security_policy");

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/settings">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
            System Configuration
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-7xl">
        <div className="space-y-4 md:space-y-6">
          <MaintenanceMode enabled={maintenance.enabled || false} />
          <BackupManager />
        </div>
        <div>
          <SecuritySettings
            initialData={{
              require_2fa: security.require_2fa || false,
              session_timeout: security.session_timeout || 30,
              password_expiry: security.password_expiry || 90,
            }}
          />
        </div>
      </div>
    </div>
  );
}
