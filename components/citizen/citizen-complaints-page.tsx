"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge"
import { ComplaintPriorityBadge } from "@/components/complaints/complaint-priority-badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Category {
  id: string
  name: string
}

interface Ward {
  id: string
  ward_number: number
  name: string
}

interface CitizenComplaintsPageProps {
  categories: Category[]
  wards: Ward[]
}

export function CitizenComplaintsPage({ categories, wards }: CitizenComplaintsPageProps) {
  const supabase = createClient()
  const [complaints, setComplaints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  })

  const loadComplaints = async () => {
    setIsLoading(true)
    try {
      let query = supabase.from("complaints").select("*, category:complaint_categories(name)")

      if (filters.status) query = query.eq("status", filters.status)
      if (filters.priority) query = query.eq("priority", filters.priority)

      const { data } = await query.order("submitted_at", { ascending: false })
      setComplaints(data || [])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Complaints</h1>
          <p className="mt-2 text-slate-600">Track and manage all your submitted complaints</p>
        </div>
        <Link href="/citizen/complaints/new">
          <Button>New Complaint</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button onClick={loadComplaints} disabled={isLoading}>
              {isLoading ? "Loading..." : "Apply Filters"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          {complaints.length === 0 ? (
            <p className="py-8 text-center text-slate-500">{isLoading ? "Loading..." : "No complaints yet"}</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {complaints.map((complaint) => (
                <Link
                  key={complaint.id}
                  href={`/citizen/complaints/${complaint.id}`}
                  className="block py-4 hover:bg-slate-50 rounded transition-colors px-4 -mx-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-mono text-sm font-semibold text-blue-600">{complaint.tracking_code}</p>
                        <ComplaintStatusBadge status={complaint.status} size="sm" />
                        <ComplaintPriorityBadge priority={complaint.priority} size="sm" />
                      </div>
                      <p className="mt-2 font-medium text-slate-900">{complaint.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{complaint.category?.name}</p>
                    </div>
                    <p className="text-sm text-slate-500 whitespace-nowrap">
                      {new Date(complaint.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
