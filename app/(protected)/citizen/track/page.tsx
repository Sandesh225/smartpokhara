/**
 * Public complaint tracking page
 * Allows anyone (logged in or not) to track complaint by tracking code
 */

"use client";

import type React from "react";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ComplaintStatusBadge } from "@/components/citizen/complaints/ComplaintStatusBadge";
import {
  showErrorToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/shared/toast-service";

interface TrackedComplaint {
  id: string;
  tracking_code: string;
  title: string;
  status: string;
  priority: string;
  submitted_at: string;
  category: { name: string } | null;
  ward: { ward_number: number; name: string } | null;
}

export default function TrackComplaintPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [complaint, setComplaint] = useState<TrackedComplaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingCode.trim()) return;

    setLoading(true);
    setError("");
    const toastId = showLoadingToast("Searching for your complaint...");

    try {
      const { data, error: queryError } = await supabase
        .from("complaints")
        .select(
          `
          id,
          tracking_code,
          title,
          status,
          priority,
          submitted_at,
          category:complaint_categories(name),
          ward:wards(ward_number, name)
        `
        )
        .eq("tracking_code", trackingCode.trim().toUpperCase())
        .maybeSingle();

      dismissToast(toastId);

      if (queryError) throw queryError;

      if (data) {
        setComplaint(data);
        setError("");
      } else {
        setError("Complaint not found. Please check your tracking code.");
        setComplaint(null);
        showErrorToast(
          "Complaint Not Found",
          "Please verify your tracking code and try again."
        );
      }
    } catch (err) {
      dismissToast(toastId);
      console.error("Error tracking complaint:", err);
      setError("Error tracking complaint. Please try again.");
      setComplaint(null);
      showErrorToast(
        "Error",
        "Unable to search for your complaint. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Track Complaint</h1>
        <p className="mt-2 text-gray-600">
          Enter your complaint tracking code to check its status.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleTrack} className="max-w-md">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="trackingCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tracking Code
              </label>
              <input
                type="text"
                id="trackingCode"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="e.g., PKR-2024-000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                You received this code when you submitted your complaint.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !trackingCode.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching..." : "Track Complaint"}
            </button>
          </div>
        </form>

        {complaint && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Complaint Found
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tracking Code:</span>
                <span className="text-sm font-mono font-medium">
                  {complaint.tracking_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Title:</span>
                <span className="text-sm font-medium">{complaint.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <ComplaintStatusBadge
                  status={complaint.status as any}
                  size="sm"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium">
                  {complaint.category?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ward:</span>
                <span className="text-sm font-medium">
                  {complaint.ward
                    ? `Ward ${complaint.ward.ward_number}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Submitted:</span>
                <span className="text-sm font-medium">
                  {new Date(complaint.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/citizen/complaints/${complaint.id}`}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
