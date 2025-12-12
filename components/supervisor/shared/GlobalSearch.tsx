"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, User, ClipboardList, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "complaint" | "staff" | "task";
  title: string;
  subtitle?: string;
  href: string;
}

interface GlobalSearchProps {
  userId: string;
}

export function GlobalSearch({ userId }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchDebounce = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const searchTerm = `%${query.toLowerCase()}%`;

      // Parallel search queries aligned with schema
      const [complaints, staff, tasks] = await Promise.all([
        supabase
          .from("complaints")
          .select("id, tracking_code, title")
          .or(`tracking_code.ilike.${searchTerm},title.ilike.${searchTerm}`)
          .limit(3),
        supabase
          .from("staff_profiles")
          .select("user_id, staff_code, users!staff_profiles_user_id_fkey(email)")
          .or(`staff_code.ilike.${searchTerm}`) // Assuming staff_code is the searchable field
          .limit(3),
        supabase
          .from("supervisor_tasks")
          .select("id, tracking_code, title")
          .or(`tracking_code.ilike.${searchTerm},title.ilike.${searchTerm}`)
          .limit(3),
      ]);

      const mergedResults: SearchResult[] = [];

      complaints.data?.forEach((c) =>
        mergedResults.push({
          id: c.id,
          type: "complaint",
          title: c.tracking_code,
          subtitle: c.title,
          href: `/supervisor/complaints/${c.id}`,
        })
      );

      staff.data?.forEach((s: any) =>
        mergedResults.push({
          id: s.user_id,
          type: "staff",
          title: s.staff_code,
          subtitle: s.users?.email || "Staff Member",
          href: `/supervisor/staff/${s.user_id}`,
        })
      );

      tasks.data?.forEach((t) =>
        mergedResults.push({
          id: t.id,
          type: "task",
          title: t.tracking_code,
          subtitle: t.title,
          href: `/supervisor/tasks/${t.id}`,
        })
      );

      setResults(mergedResults);
      setLoading(false);
    }, 400);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "complaint": return <FileText className="h-4 w-4 text-blue-500" />;
      case "staff": return <User className="h-4 w-4 text-green-500" />;
      case "task": return <ClipboardList className="h-4 w-4 text-purple-500" />;
      default: return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search complaints, tasks, staff code..."
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          {loading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Top Results
              </div>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result.href)}
                  className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors group"
                >
                  <div className="mt-0.5 bg-gray-100 p-1.5 rounded-md group-hover:bg-white transition-colors">
                    {getIcon(result.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-medium text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded capitalize">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}