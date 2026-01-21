// ═══════════════════════════════════════════════════════════
// app/(protected)/admin/settings/page.tsx - SETTINGS HUB
// ═══════════════════════════════════════════════════════════

import Link from "next/link";
import {
  Settings,
  Shield,
  Globe,
  Layers,
  Zap,
  Database,
  ArrowRight,
} from "lucide-react";

const SettingsCard = ({ icon: Icon, title, desc, href }: any) => (
  <Link
    href={href}
    className="stone-card p-5 md:p-6 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
    <div className="relative">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
        <Icon className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      <h3 className="font-black text-base md:text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      <div className="flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Configure <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  </Link>
);

export default function SettingsPage() {
  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tighter">
            System Settings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium mt-0.5">
            Configure platform parameters and integrations
          </p>
        </div>
      </div>

      {/* SETTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SettingsCard
          icon={Layers}
          title="Categories & Mapping"
          desc="Manage complaint categories and route them to departments."
          href="/admin/settings/categories"
        />
        <SettingsCard
          icon={Zap}
          title="Integrations & API"
          desc="Payment gateways, SMS providers, and Map API keys."
          href="/admin/settings/integrations"
        />
        <SettingsCard
          icon={Settings}
          title="Service Levels (SLA)"
          desc="Configure resolution timelines and priority rules."
          href="/admin/settings/sla"
        />
        <SettingsCard
          icon={Database}
          title="System & Backup"
          desc="Database maintenance, backups, and system logs."
          href="/admin/settings/system"
        />
        <SettingsCard
          icon={Shield}
          title="Security Policies"
          desc="Password rules, 2FA enforcement, and session limits."
          href="/admin/settings/system"
        />
        <SettingsCard
          icon={Globe}
          title="Localization"
          desc="Language preferences and regional formats."
          href="/admin/settings/system"
        />
      </div>
    </div>
  );
}
