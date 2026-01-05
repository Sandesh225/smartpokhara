import { Database, Download, RefreshCw } from 'lucide-react';

export default function BackupManager() {
  return (
    <div className="stone-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Database className="w-6 h-6" /></div>
        <div>
          <h3 className="font-bold text-foreground">Database Backups</h3>
          <p className="text-xs text-muted-foreground">Last backup: 2 hours ago (Auto)</p>
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg bg-neutral-stone-50 text-sm">
            <span className="font-mono text-muted-foreground">backup_2024_05_{10+i}.sql.gz</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">12.4 MB</span>
              <button className="text-primary hover:underline flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full py-2.5 border border-primary text-primary font-medium rounded-lg hover:bg-primary/5 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4" /> Trigger Manual Backup
      </button>
    </div>
  );
}