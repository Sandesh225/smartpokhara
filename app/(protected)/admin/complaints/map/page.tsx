"use client";
import { ComplaintMapView } from "../_components/ComplaintMapView";
import { useComplaintManagement } from "@/hooks/admin/useComplaintManagement";

export default function MapPage() {
  const { complaints } = useComplaintManagement();
  
  return (
    <div className="h-[calc(100vh-100px)] w-full relative">
       <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded shadow">
          <h1 className="font-bold">GIS Complaint View</h1>
          <p className="text-xs text-gray-500">{complaints.length} active markers</p>
       </div>
       <ComplaintMapView complaints={complaints} />
    </div>
  );
}