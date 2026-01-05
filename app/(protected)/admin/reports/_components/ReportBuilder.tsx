"use client";

import { useState } from "react";
import { Calendar, Filter, Layers } from "lucide-react";

export default function ReportBuilder() {
  const [modules, setModules] = useState<string[]>(["complaints"]);

  const toggleModule = (mod: string) => {
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  return (
    <div className="stone-card p-0 overflow-hidden">
      <div className="p-6 border-b border-border bg-neutral-stone-50">
        <h3 className="font-bold text-lg text-primary">
          Custom Report Builder
        </h3>
        <p className="text-sm text-muted-foreground">
          Select data sources and parameters.
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* 1. Data Modules */}
        <div>
          <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Data Sources
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Complaints", "Revenue", "Staff Performance", "Inventory"].map(
              (m) => (
                <div
                  key={m}
                  onClick={() => toggleModule(m.toLowerCase())}
                  className={`cursor-pointer p-3 rounded-lg border text-sm font-medium text-center transition-all ${
                    modules.includes(m.toLowerCase())
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white border-border hover:bg-neutral-stone-50"
                  }`}
                >
                  {m}
                </div>
              )
            )}
          </div>
        </div>

        {/* 2. Date Range */}
        <div>
          <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Time Period
          </label>
          <div className="flex gap-4">
            <input type="date" className="dept-input-base" />
            <span className="self-center text-muted-foreground">to</span>
            <input type="date" className="dept-input-base" />
          </div>
        </div>

        {/* 3. Filters */}
        <div>
          <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Optional Filters
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="dept-input-base">
              <option>All Wards</option>
              <option>Ward 1</option>
              <option>Ward 2</option>
            </select>
            <select className="dept-input-base">
              <option>All Statuses</option>
              <option>Resolved Only</option>
              <option>Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-neutral-stone-50 flex justify-end">
        <button className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg shadow-md hover:bg-opacity-90">
          Generate Report
        </button>
      </div>
    </div>
  );
}
