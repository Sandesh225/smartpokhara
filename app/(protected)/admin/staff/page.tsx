"use client";

import { useStaffManagement } from "@/hooks/admin/useStaffManagement";
import { StaffTable } from "./_components/StaffTable";
import { StaffWorkload } from "./_components/StaffWorkload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Search,
  Users,
  Briefcase,
  Activity,
  Shield,
  BarChart3,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function StaffDirectoryPage() {
  const { staffList, loading, filters, setFilters, deactivateStaff } =
    useStaffManagement();
  const router = useRouter();

  // Instant Client-Side Stats
  const stats = useMemo(
    () => ({
      total: staffList.length,
      active: staffList.filter((s) =>
        ["available", "busy"].includes(s.availability_status)
      ).length,
      onBreak: staffList.filter((s) => s.availability_status === "on_break")
        .length,
      highLoad: staffList.filter((s) => (s.current_workload || 0) >= 8).length,
    }),
    [staffList]
  );

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time status, manage assignments, and oversee municipal
            workforce.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="border-slate-300">
            <Link href="/admin/staff/roles">
              <Shield className="mr-2 h-4 w-4" /> Manage Roles
            </Link>
          </Button>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
          >
            <Link href="/admin/staff/create">
              <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <Tabs defaultValue="directory" className="w-full">
          <TabsList className="bg-transparent p-0 h-auto space-x-8">
            <TabsTrigger
              value="directory"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-medium"
            >
              <Users className="w-4 h-4 mr-2" /> Directory
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              onClick={() => router.push("/admin/staff/performance")}
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-3 bg-transparent text-slate-500 hover:text-slate-900"
            >
              <BarChart3 className="w-4 h-4 mr-2" /> Performance
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              onClick={() => router.push("/admin/staff/roles")}
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 py-3 bg-transparent text-slate-500 hover:text-slate-900"
            >
              <Shield className="w-4 h-4 mr-2" /> Permissions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3. Live Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard
          label="Total Staff"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatusCard
          label="Currently Active"
          value={stats.active}
          icon={Activity}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatusCard
          label="On Break"
          value={stats.onBreak}
          icon={Briefcase}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatusCard
          label="High Workload"
          value={stats.highLoad}
          icon={BarChart3}
          color="text-red-600"
          bg="bg-red-50"
        />
      </div>

      {/* 4. Main Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left: Filters & Table */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search staff..."
                  className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
              <div className="flex w-full md:w-auto gap-2 items-center">
                <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
                <Select
                  value={filters.role}
                  onValueChange={(v: any) =>
                    setFilters((prev) => ({ ...prev, role: v }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[160px] bg-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ward_staff">Ward Staff</SelectItem>
                    <SelectItem value="dept_staff">Dept Staff</SelectItem>
                    <SelectItem value="field_staff">Field Agent</SelectItem>
                    <SelectItem value="dept_head">Supervisor</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(v: any) =>
                    setFilters((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[130px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <StaffTable
            data={staffList}
            loading={loading}
            onDeactivate={deactivateStaff}
          />
        </div>

        {/* Right: Sidebar Widgets */}
        <div className="space-y-6">
          <StaffWorkload />

          <Card className="bg-linear-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold text-indigo-900 mb-2">
                Optimize Shifts
              </h3>
              <p className="text-xs text-indigo-600/80 mb-4 leading-relaxed">
                View detailed performance analytics to balance workload
                distribution effectively.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                asChild
              >
                <Link href="/admin/staff/performance">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatusCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
