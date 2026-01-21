// ═══════════════════════════════════════════════════════════
// _components/BackupManager.tsx
// ═══════════════════════════════════════════════════════════

"use client";

import { Database, Download, RefreshCw, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BackupManager() {
  const backups = [
    { name: "backup_2026_01_21.sql.gz", size: "12.4 MB", date: "2 hours ago" },
    { name: "backup_2026_01_20.sql.gz", size: "12.1 MB", date: "1 day ago" },
    { name: "backup_2026_01_19.sql.gz", size: "11.9 MB", date: "2 days ago" },
  ];

  return (
    <div className="stone-card overflow-hidden">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b-2 border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info-blue/10">
              <Database className="w-5 h-5 text-info-blue" />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg text-foreground">
                Database Backups
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Last backup: 2 hours ago (Auto)
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-success-green/30 bg-success-green/10 text-success-green text-[10px] font-bold"
          >
            AUTO-ENABLED
          </Badge>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-6">
        <div className="space-y-2 mb-4">
          {backups.map((backup, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 md:p-4 border-2 border-border rounded-lg bg-card hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-muted">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs md:text-sm text-foreground font-bold truncate">
                    {backup.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {backup.date} • {backup.size}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 font-bold text-primary hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 font-bold border-2 hover:bg-primary/5 hover:border-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Trigger Manual Backup
        </Button>
      </div>
    </div>
  );
}
