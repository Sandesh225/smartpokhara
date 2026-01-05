"use client";

import { FileSpreadsheet, FileText, Download } from "lucide-react";

export default function ExportOptions() {
  const handleExport = (format: "csv" | "pdf" | "excel") => {
    // Logic to trigger backend export or client-side generation would go here
    alert(`Exporting as ${format.toUpperCase()}...`);
  };

  return (
    <div className="stone-panel p-4 flex items-center justify-between bg-neutral-stone-50">
      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Download className="w-4 h-4" /> Export Data
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => handleExport("csv")}
          className="px-3 py-1.5 bg-white border border-border rounded text-sm font-medium hover:bg-neutral-stone-100 flex items-center gap-2"
        >
          <FileText className="w-3.5 h-3.5 text-green-600" /> CSV
        </button>
        <button
          onClick={() => handleExport("excel")}
          className="px-3 py-1.5 bg-white border border-border rounded text-sm font-medium hover:bg-neutral-stone-100 flex items-center gap-2"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" /> Excel
        </button>
        <button
          onClick={() => handleExport("pdf")}
          className="px-3 py-1.5 bg-white border border-border rounded text-sm font-medium hover:bg-neutral-stone-100 flex items-center gap-2"
        >
          <FileText className="w-3.5 h-3.5 text-red-600" /> PDF
        </button>
      </div>
    </div>
  );
}
