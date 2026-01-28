"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  X,
  ShieldCheck,
  Wifi,
  Inbox,
  AlertCircle,
  MapPin,
  MoreHorizontal,
  Download,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createClient } from "@/lib/supabase/client";
import { complaintsService } from "@/lib/supabase/queries/complaints";
import type { Complaint } from "@/lib/supabase/queries/complaints";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   1. PREMIUM COMPONENT: Registry Stat Card
   ───────────────────────────────────────────────────────────── */
function RegistryStat({
  label,
  value,
  icon: Icon,
  colorClass, // e.g., "bg-primary"
  textColorClass, // e.g., "text-primary"
  delay = 0,
}: {
  label: string;
  value: number;
  icon: any;
  colorClass: string;
  textColorClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", colorClass)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <h3 className="mt-4 text-4xl font-black tracking-tighter text-foreground tabular-nums">
            {value}
          </h3>
        </div>
        <div className={cn("rounded-xl bg-muted/50 p-3 transition-colors group-hover:bg-white", textColorClass)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. PREMIUM COMPONENT: Status Badge
   ───────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    open: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-purple-100 text-purple-700 border-purple-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  const labels: Record<string, string> = {
    pending: "In Review",
    open: "Ticket Open",
    in_progress: "Processing",
    resolved: "Resolved",
    rejected: "Closed",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide transition-colors",
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. MAIN PAGE
   ───────────────────────────────────────────────────────────── */
export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  // --- State ---
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const pageSize = 10;

  // --- Logic: Param Updates ---
  const updateParams = useCallback(
    (params: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) =>
        v ? p.set(k, v) : p.delete(k)
      );
      router.replace(`?${p.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // --- Logic: Search Debounce ---
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
      updateParams({ search: value, page: "1" });
    }, 400);
  };

  // --- Logic: Fetch ---
  const fetchData = useCallback(
    async (silent = false) => {
      silent ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const [res, statsRes] = await Promise.all([
          complaintsService.getUserComplaints({
            search_term: debouncedSearch || undefined,
            limit: pageSize,
            offset: (page - 1) * pageSize,
          }),
          complaintsService.getDashboardStats(),
        ]);
        setComplaints(res.complaints);
        setTotal(res.total);
        setStats(statsRes.complaints);
      } catch (err) {
        toast.error("Sync Error", {
          description: "Could not retrieve latest registry data.",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [debouncedSearch, page]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  // --- Render ---
  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* ── HEADER SECTION ── */}
      <div className="border-b bg-card/50 backdrop-blur-xl top-0 z-30">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Title Area */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
                  My Complaints
                </h1>
              </div>
              <p className="text-muted-foreground font-medium max-w-lg">
                Manage your filed reports, track municipal responses, and view
                case history.
              </p>
            </div>

            {/* Action Area */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="h-12 border-2 px-4 font-bold rounded-xl"
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
                />
                Sync
              </Button>
              <Button
                onClick={() => router.push("/citizen/complaints/new")}
                className="h-12 bg-primary px-6 font-bold text-primary-foreground shadow-lg hover:shadow-primary/25 rounded-xl transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5 stroke-[3]" />
                Log New Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RegistryStat
            label="Total Cases"
            value={stats.total}
            icon={FileText}
            colorClass="bg-primary"
            textColorClass="text-primary"
            delay={0}
          />
          <RegistryStat
            label="Pending Review"
            value={stats.open}
            icon={Clock}
            colorClass="bg-amber-500"
            textColorClass="text-amber-600"
            delay={0.1}
          />
          <RegistryStat
            label="In Progress"
            value={stats.in_progress}
            icon={Activity}
            colorClass="bg-blue-500"
            textColorClass="text-blue-600"
            delay={0.2}
          />
          <RegistryStat
            label="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            colorClass="bg-emerald-500"
            textColorClass="text-emerald-600"
            delay={0.3}
          />
        </div>

        {/* ── MAIN CONTENT CARD ── */}
        <Card className="overflow-hidden border-none shadow-xl rounded-2xl bg-card">
          {/* Toolbar */}
          <div className="border-b bg-muted/30 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by ID, Title, or Category..."
                  className="h-12 rounded-xl border-2 bg-background pl-12 font-medium focus-visible:ring-offset-0"
                />
              </div>

              {/* Filters / Meta */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="h-10 px-4 rounded-lg border-2 font-bold text-muted-foreground bg-background"
                >
                  <Wifi className="w-3 h-3 mr-2 text-green-500" />
                  Live Database
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl border-2"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-4"
                >
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  <p className="font-bold text-muted-foreground animate-pulse">
                    Retrieving records...
                  </p>
                </motion.div>
              ) : complaints.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-6 text-center"
                >
                  <div className="rounded-full bg-muted p-8">
                    <Inbox className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-foreground">
                      No Complaints Found
                    </h3>
                    <p className="text-muted-foreground">
                      {search
                        ? "Try adjusting your search filters."
                        : "You haven't filed any complaints yet."}
                    </p>
                  </div>
                  {search && (
                    <Button
                      variant="link"
                      onClick={() => handleSearch("")}
                      className="text-primary font-bold"
                    >
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="w-[120px] pl-6 font-bold text-foreground">
                          Ticket ID
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Subject
                        </TableHead>
                        <TableHead className="hidden font-bold text-foreground md:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="hidden font-bold text-foreground md:table-cell">
                          Submitted
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Status
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() =>
                            router.push(`/citizen/complaints/${c.id}`)
                          }
                          className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/40 group"
                        >
                          <TableCell className="pl-6 font-mono text-xs font-bold text-muted-foreground group-hover:text-primary">
                            #{c.ticket_number?.slice(-6) || "---"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                                {c.title}
                              </p>
                              <Badge variant="secondary" className="...">
                                {typeof c.category === "object"
                                  ? c.category.name
                                  : c.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/70" />
                              {c.ward
                                ? `Ward ${c.ward.ward_number}`
                                : "General"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden text-sm font-medium text-muted-foreground md:table-cell">
                            {format(new Date(c.submitted_at), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={c.status} />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-xl border-2 shadow-xl"
                              >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/citizen/complaints/${c.id}`)
                                  }
                                  className="font-medium cursor-pointer"
                                >
                                  <FileText className="mr-2 h-4 w-4" /> View
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-medium cursor-pointer">
                                  <Download className="mr-2 h-4 w-4" /> Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </AnimatePresence>
          </CardContent>

          {/* Pagination */}
          {!isLoading && complaints.length > 0 && (
            <div className="flex items-center justify-between border-t bg-muted/20 p-4">
              <p className="text-sm font-bold text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 rounded-lg border-2 font-bold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 rounded-lg border-2 font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}