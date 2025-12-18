"use client";
import { useComplaintManagement } from "@/hooks/admin/useComplaintManagement";
import { useEffect } from "react";

export default function BulkAssignPage() {
  const { 
    setFilters, 
  } = useComplaintManagement();

  // Filter to unassigned only on mount
  useEffect(() => {
     // setFilters(prev => ({ ...prev, status: ['received'] })); 
  }, []);

  return (
     <div className="space-y-6">
        <h1 className="text-2xl font-bold">Unassigned Queue</h1>
        <div className="border rounded bg-white p-8 text-center text-gray-500">
           Bulk Assignment Interface Placeholder (Uses shared Table component)
        </div>
     </div>
  );
}