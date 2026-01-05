import Link from 'next/link';
import { Settings, Shield, Globe, Layers, Zap, Database } from 'lucide-react';

const SettingsCard = ({ icon: Icon, title, desc, href }: any) => (
  <Link href={href} className="stone-card p-6 hover:border-primary hover:shadow-md transition-all group">
    <div className="w-12 h-12 rounded-xl bg-neutral-stone-100 flex items-center justify-center text-muted-foreground mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-foreground text-lg mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </Link>
);

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform parameters and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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