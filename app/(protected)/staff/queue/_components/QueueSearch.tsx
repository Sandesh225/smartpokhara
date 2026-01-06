"use client";
import { Search, Filter, ArrowUpDown } from "lucide-react";

interface Props {
  onSearch: (term: string) => void;
}

export function QueueSearch({ onSearch }: Props) {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by ID, title, or address..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>
      <button className="p-2.5 bg-white border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm">
        <Filter className="w-5 h-5" />
      </button>
      <button className="p-2.5 bg-white border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm">
        <ArrowUpDown className="w-5 h-5" />
      </button>
    </div>
  );
}