"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Assuming you have a badge component, or standard span
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";

export default function CitizensTable({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Ward</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((citizen) => (
              <tr
                key={citizen.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {citizen.profile?.full_name || "N/A"}
                </td>
                <td className="px-6 py-4 text-gray-500">{citizen.email}</td>
                <td className="px-6 py-4">
                  {citizen.profile?.ward_id ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ward {citizen.profile.ward_id}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      citizen.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {citizen.is_active ? "Active" : "Inactive"}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(citizen.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/citizens/${citizen.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-8 text-center text-gray-500">No citizens found.</div>
      )}
    </div>
  );
}
