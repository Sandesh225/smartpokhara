// components/supervisor/ComplaintList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Clock, 
  MapPin, 
  User, 
  AlertCircle,
  ChevronRight,
  MoreVertical
} from "lucide-react";

interface Complaint {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  ward: { name: string } | null;
  department: { name: string } | null;
  category: { name: string } | null;
  assigned_staff: any;
}

interface ComplaintListProps {
  complaints: Complaint[];
}

export default function ComplaintList({ complaints }: ComplaintListProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-purple-100 text-purple-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="divide-y divide-gray-200">
      {complaints.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No active complaints in your jurisdiction
        </div>
      ) : (
        complaints.map((complaint) => (
          <div 
            key={complaint.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    #{complaint.tracking_code}
                  </span>
                </div>

                <h4 className="font-medium text-gray-900 mb-1">
                  {complaint.title}
                </h4>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {complaint.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(complaint.created_at)}
                  </div>

                  {complaint.ward && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {complaint.ward.name}
                    </div>
                  )}

                  {complaint.category && (
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {complaint.category.name}
                    </div>
                  )}

                  {complaint.assigned_staff && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {complaint.assigned_staff.user?.user_profiles?.full_name || "Staff"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setSelectedComplaint(
                    selectedComplaint === complaint.id ? null : complaint.id
                  )}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                <Link
                  href={`/supervisor/complaints/${complaint.id}`}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </Link>
              </div>
            </div>

            {selectedComplaint === complaint.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Assign
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                    Escalate
                  </button>
                  <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                    Add Note
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}