"use client";
import { Search, Filter, ArrowUpDown } from "lucide-react";

interface Props {
  onSearch: (term: string) => void;
}

export function QueueSearch({ onSearch }: Props) {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by ID, title, or address..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
        />
      </div>
      <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-xs active:scale-95">
        <Filter className="w-5 h-5" />
      </button>
      <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-xs active:scale-95">
        <ArrowUpDown className="w-5 h-5" />
      </button>
    </div>
  );
}