"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Calendar,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { format } from "date-fns";
// NOTE: You must import/create a client-side Supabase client for real-time
// For example:
import { createClient } from "@/lib/supabase/client";

// --- Types (Kept as is) ---

export type ComplaintStatus = 
  | 'draft' | 'submitted' | 'received' | 'assigned' | 'accepted' 
  | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'reopened';

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export interface RpcMyComplaint {
  id: string;
  tracking_code: string;
  title: string;
  category_name: string;
  subcategory_name: string | null;
  status: ComplaintStatus;
  priority: Priority;
  ward_number: number | null;
  submitted_at: string;
  last_updated_at: string | null;
  sla_due_at: string | null;
  is_overdue: boolean;
  assigned_department_name: string | null;
  thumbnail_url: string | null;
  upvote_count: number;
}

export interface CitizenDashboardStats {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  overdue: number;
}

interface Props {
  userId: string;
  displayName: string;
  roleName: string;
  profile: any;
  // Initial data is passed from server, but client will manage real-time updates
  complaints: RpcMyComplaint[]; 
  stats: CitizenDashboardStats; 
  statsData: any; 
}

// --- Helper Components (Kept as is) ---
const StatusBadge = ({ status }: { status: ComplaintStatus }) => {
  // ... (StatusBadge component content as before)
  const styles = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    received: "bg-indigo-50 text-indigo-700 border-indigo-200",
    assigned: "bg-purple-50 text-purple-700 border-purple-200",
    accepted: "bg-cyan-50 text-cyan-700 border-cyan-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    reopened: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const labels = {
    draft: "Draft",
    submitted: "Submitted",
    received: "Received",
    assigned: "Assigned",
    accepted: "Accepted",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
    reopened: "Reopened",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  // ... (PriorityBadge component content as before)
  const styles = {
    low: "text-gray-600 bg-gray-100",
    medium: "text-blue-600 bg-blue-50",
    high: "text-orange-600 bg-orange-50",
    urgent: "text-red-600 bg-red-50",
    critical: "text-red-700 bg-red-100 font-bold",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// --- Main Component ---

export default function CitizenDashboardClient({
  userId,
  displayName,
  profile,
  complaints: initialComplaints, // Use initial data for first render
  stats: initialStats,           // Use initial data for first render
}: Props) {
  // Client state for real-time data
  const [liveComplaints, setLiveComplaints] = useState(initialComplaints);
  const [liveStats, setLiveStats] = useState(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const supabase = useMemo(() => createClient(), []); // Initialize client-side Supabase

  // --- Complaint Data Processing ---

  // Function to re-calculate stats from a list of complaints
  const calculateStats = useCallback((complaintList: RpcMyComplaint[]): CitizenDashboardStats => {
    return {
      totalComplaints: complaintList.length,
      pending: complaintList.filter((c) =>
        ["submitted", "received", "assigned"].includes(c.status)
      ).length,
      inProgress: complaintList.filter((c) =>
        ["accepted", "in_progress"].includes(c.status)
      ).length,
      resolved: complaintList.filter((c) =>
        ["resolved", "closed"].includes(c.status)
      ).length,
      overdue: complaintList.filter((c) => c.is_overdue).length,
    };
  }, []);

  // Filter Logic (uses liveComplaints)
  const filteredComplaints = useMemo(() => {
    // We sort the complaints to show the most recent updates first
    const sortedComplaints = [...liveComplaints].sort((a, b) => 
      new Date(b.last_updated_at || b.submitted_at).getTime() - 
      new Date(a.last_updated_at || a.submitted_at).getTime()
    );

    return sortedComplaints.filter((c) => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [liveComplaints, searchTerm, statusFilter]);

  // --- Real-time Subscription Effect ---

  useEffect(() => {
    // 1. Subscribe to changes in the 'complaints' table relevant to the user (owner_id = userId)
    const complaintsChannel = supabase
      .channel("citizen_complaints_updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for INSERT, UPDATE, DELETE
          schema: "public",
          table: "complaints",
          filter: `owner_id=eq.${userId}`, // Only listen for the current user's complaints
        },
        (payload) => {
          // --- Real-time Logic ---

          // Re-fetch all complaints to ensure the full, filtered, and processed data is available.
          // In a high-performance scenario, one might try to reconcile the payload delta,
          // but a full re-fetch is safer for complex derived fields (like `is_overdue` and stats).
          // NOTE: We call the same RPC used in the Server Component.
          supabase.rpc("rpc_get_my_complaints", {
              p_status: null,
              p_limit: 50, // Re-fetch the data limit from the server component
              p_offset: 0,
            })
            .then(({ data, error }) => {
              if (error) {
                console.error("Error re-fetching complaints:", error);
                return;
              }
              const newComplaints = data as RpcMyComplaint[];

              // Update state
              setLiveComplaints(newComplaints);
              setLiveStats(calculateStats(newComplaints));
              console.log(`Real-time update received: ${payload.eventType}. Complaints and stats updated.`);
            });
        }
      )
      .subscribe();

    // 2. Add subscriptions for other dynamic data like 'bills' and 'notices' here
    // For example:
    /*
    const noticesChannel = supabase
        .channel("citizen_notices_updates")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "notices",
                filter: `ward_id=eq.${profile?.ward_id}`, 
            },
            (payload) => {
                // Logic to update recent notices state...
            }
        ).subscribe();
    */

    // Cleanup function
    return () => {
      supabase.removeChannel(complaintsChannel);
      // supabase.removeChannel(noticesChannel);
    };
  }, [supabase, userId, calculateStats]); // Dependencies for useEffect


  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Section (Kept as is) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Namaste, {displayName}
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                {profile?.ward?.name ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    Ward No. {profile.ward.ward_number} - {profile.ward.name}
                  </>
                ) : (
                  "Welcome to Smart City Pokhara Portal"
                )}
              </p>
            </div>
            
            <Link 
              href="/citizen/complaints/new" 
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
            >
              <Plus className="w-5 h-5" />
              File New Complaint
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid - **USES liveStats** */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Submitted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{liveStats.totalComplaints}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{liveStats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{liveStats.inProgress}</p>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{liveStats.resolved}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Overdue/Action Required - Combined with a dedicated check */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Action Required</p>
                <p className="text-3xl font-bold text-rose-600 mt-2">{liveStats.overdue}</p>
              </div>
              <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            {liveStats.overdue > 0 && (
                <p className="text-xs text-rose-600 mt-2 font-medium">Includes overdue items</p>
            )}
          </div>
        </div>
        
        {/* Quick Actions (Placeholder - add components for bills/notices here) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Pending Bills</h3>
                <p className="text-2xl font-bold text-blue-600">Rs. 0.00</p> {/* Placeholder for bill data */}
                <Link href="/citizen/bills" className="text-sm text-blue-500 hover:text-blue-700 font-medium mt-2 flex items-center">View All Bills <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Recent Ward Notice</h3>
                {/* Placeholder for real-time Notice data */}
                <p className="text-gray-500 text-sm">No new notices for Ward {profile?.ward?.ward_number} in the last 7 days.</p>
                <Link href="/citizen/notices" className="text-sm text-blue-500 hover:text-blue-700 font-medium mt-2 flex items-center">View All Notices <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </div>
        </div>


        {/* Filters & Search (Kept as is) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID, title, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Complaints List - **USES filteredComplaints (which uses liveComplaints)** */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            My Complaints
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{filteredComplaints.length}</span>
          </h2>

          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                {searchTerm ? "Try adjusting your search filters." : "You haven't submitted any complaints yet."}
              </p>
              {!searchTerm && (
                <Link 
                  href="/citizen/complaints/new" 
                  className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                >
                  Submit your first complaint
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {/* Only show the last 5 complaints as per requirements, 
                  but still allow filtering/searching the full list */}
              {filteredComplaints.slice(0, 5).map((complaint) => ( 
                <div 
                  key={complaint.id} 
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  {complaint.is_overdue && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex h-12 w-12 bg-blue-50 rounded-lg items-center justify-center shrink-0">
                         <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {complaint.tracking_code}
                          </span>
                          <StatusBadge status={complaint.status} />
                          {complaint.is_overdue && (
                            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {complaint.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            {complaint.category_name} 
                            {complaint.subcategory_name && ` / ${complaint.subcategory_name}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(complaint.submitted_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Meta */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pl-4 md:pl-0 border-l md:border-l-0 border-gray-100">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">Priority</span>
                        <PriorityBadge priority={complaint.priority} />
                      </div>
                      
                      <Link 
                        href={`/citizen/complaints/${complaint.id}`}
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {/* Link to all complaints */}
              {liveComplaints.length > 5 && (
                <div className="text-center pt-2">
                    <Link 
                        href="/citizen/complaints" 
                        className="text-blue-600 font-medium hover:underline flex items-center justify-center"
                    >
                        View All {liveComplaints.length} Complaints
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}