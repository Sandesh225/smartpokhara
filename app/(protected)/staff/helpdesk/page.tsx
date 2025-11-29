// app/(protected)/staff/helpdesk/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database.types";
import { HelpdeskComplaintForm } from "@/components/staff/HelpdeskComplaintForm";

type Complaint = Database['public']['Tables']['complaints']['Row'] & {
  complaint_categories?: { name: string };
  user_profiles?: { full_name: string; phone: string };
};

export default function HelpdeskPage() {
  const [activeTab, setActiveTab] = useState<"create" | "search">("create");
  const [searchResults, setSearchResults] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [successTrackingCode, setSuccessTrackingCode] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);

    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          complaint_categories(name),
          user_profiles(full_name, phone)
        `)
        .or(`tracking_code.ilike.%${searchQuery}%,user_profiles.phone.ilike.%${searchQuery}%,user_profiles.full_name.ilike.%${searchQuery}%`)
        .order("submitted_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching complaints:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleComplaintSuccess = (trackingCode: string) => {
    setSuccessTrackingCode(trackingCode);
    setActiveTab("search");
    setSearchQuery(trackingCode);
    // Auto-search for the created complaint
    setTimeout(() => {
      handleSearch(new Event('submit') as any);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Helpdesk</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create new complaints and search existing ones for citizen support.
        </p>
      </div>

      {/* Success Message */}
      {successTrackingCode && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="shrik-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Complaint created successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Tracking code: <strong>{successTrackingCode}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("create")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "create"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Create Complaint
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === "search"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Search Complaints
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "create" && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <HelpdeskComplaintForm onSuccess={handleComplaintSuccess} />
        </div>
      )}

      {activeTab === "search" && (
        <div className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search by tracking code, phone number, or citizen name..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Search Results */}
          <div className="rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tracking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Citizen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {searchResults.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {complaint.tracking_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{complaint.title}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {complaint.user_profiles?.full_name || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {complaint.user_profiles?.phone || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        complaint.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(complaint.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {searchResults.length === 0 && searchQuery && !searchLoading && (
              <div className="px-6 py-12 text-center">
                <div className="text-sm text-gray-500">No complaints found</div>
              </div>
            )}

            {searchResults.length === 0 && !searchQuery && (
              <div className="px-6 py-12 text-center">
                <div className="text-sm text-gray-500">Enter search terms to find complaints</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}