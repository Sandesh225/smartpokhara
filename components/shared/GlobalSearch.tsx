'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, User, ClipboardList, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientSideClient } from '@/lib/supabase/client';

// Types for search results
type SearchCategory = 'complaints' | 'staff' | 'tasks';

interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string; // e.g., "Ward 4 • High Priority"
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const supabase = createClientSideClient();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      
      try {
        // NOTE: Replace this with your actual Supabase RPC call
        // const { data } = await supabase.rpc('global_search', { search_term: query });
        
        // Simulating API latency and data for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock Data Response
        const mockResults: SearchResult[] = [
          { id: '1', category: 'complaints', title: `Complaint #${Math.floor(Math.random()*1000)}: Pothole`, subtitle: 'Ward 4 • High', href: '/supervisor/complaints/1' },
          { id: '2', category: 'staff', title: 'Ram Bahadur', subtitle: 'Sanitation Dept', href: '/supervisor/staff/ram-bahadur' },
          { id: '3', category: 'tasks', title: 'Fix Streetlight', subtitle: 'Task #992', href: '/supervisor/tasks/3' },
        ].filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.category.includes(query.toLowerCase()));

        setResults(mockResults);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: SearchCategory) => {
    switch (category) {
      case 'complaints': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'staff': return <User className="h-4 w-4 text-green-500" />;
      case 'tasks': return <ClipboardList className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search complaints, staff, tasks..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
        />
        
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
        ) : query.length > 0 ? (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full origin-top rounded-lg border bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
          {results.length > 0 ? (
            <div>
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                Results
              </div>
              <ul>
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      onClick={() => {
                        router.push(result.href);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50",
                        index === selectedIndex && "bg-blue-50 ring-1 ring-inset ring-blue-500/20"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {getCategoryIcon(result.category)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.subtitle}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t bg-gray-50 px-4 py-2">
                <button className="text-xs font-medium text-blue-600 hover:underline">
                  View all {results.length} results
                </button>
              </div>
            </div>
          ) : !isLoading && query.length >= 2 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}