// ═══════════════════════════════════════════════════════════
// STAFF DIRECTORY PAGE - Main List
// ═══════════════════════════════════════════════════════════

"use client";

import { useStaffList, useStaffMutations } from "@/features/staff";
import { StaffFiltersState } from "@/features/staff/types";
import { useState } from "react";
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
import { StaffTable } from "./_components/StaffTable";
import { StaffWorkload } from "./_components/StaffWorkload";

export default function StaffDirectoryPage() {
  const [filters, setFilters] = useState<StaffFiltersState>({
    search: "",
    role: "all",
    department_id: null,
    ward_id: null,
    status: "active",
  });

  const { data: staffList = [], isLoading: loading } = useStaffList(filters);
  const router = useRouter();
  const { updateStaff } = useStaffMutations();

  const handleDeactivate = (id: string) => {
      if (confirm("Are you sure you want to deactivate?")) {
          updateStaff.mutate({ id, updates: { is_active: false } });
      }
  }

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
  
  // NOTE: Role based scoping (e.g. Dept Head only seeing own staff) 
  // needs to be handled either by passing initial filters or by server-side RLS/API logic.
  // Ideally, useStaffList hook should handle this if we pass current user context, 
  // or we set the initial state of filters based on user role here.
  // For now, assuming admin view or filters handle it.

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-8 md:pb-10 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground">
            Staff Management
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Monitor real-time status and oversee municipal workforce
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button variant="outline" asChild size="sm" className="h-9">
            <Link href="/admin/staff/roles">
              <Shield className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Manage Roles</span>
              <span className="sm:hidden">Roles</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-9 shadow-sm">
            <Link href="/admin/staff/create">
              <UserPlus className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Add Staff</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* TABS - Horizontal scroll on mobile */}
      <div className="border-b border-border overflow-x-auto scrollbar-hide">
        <Tabs defaultValue="directory" className="w-full min-w-max md:min-w-0">
          <TabsList className="bg-transparent p-0 h-auto space-x-4 md:space-x-8">
            <TabsTrigger
              value="directory"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-1 py-3 bg-transparent text-sm font-bold"
            >
              <Users className="w-4 h-4 mr-2" />
              <span>Directory</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              onClick={() => router.push("/admin/staff/performance")}
              className="rounded-none px-1 py-3 bg-transparent text-muted-foreground hover:text-foreground text-sm font-bold"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              onClick={() => router.push("/admin/staff/roles")}
              className="rounded-none px-1 py-3 bg-transparent text-muted-foreground hover:text-foreground text-sm font-bold"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Permissions</span>
              <span className="sm:hidden">Perms</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatusCard
          label="Total Staff"
          value={stats.total}
          icon={Users}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatusCard
          label="Currently Active"
          value={stats.active}
          icon={Activity}
          color="text-success-green"
          bg="bg-success-green/10"
        />
        <StatusCard
          label="On Break"
          value={stats.onBreak}
          icon={Briefcase}
          color="text-warning-amber"
          bg="bg-warning-amber/10"
        />
        <StatusCard
          label="High Workload"
          value={stats.highLoad}
          icon={BarChart3}
          color="text-error-red"
          bg="bg-error-red/10"
        />
      </div>

      {/* MAIN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
        {/* FILTERS & TABLE */}
        <div className="xl:col-span-3 space-y-4">
          {/* SEARCH & FILTERS */}
          <Card className="stone-card">
            <CardContent className="p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  className="pl-10"
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>

              {/* Filters */}
              <div className="flex w-full md:w-auto gap-2 items-center">
                <Filter className="w-4 h-4 text-muted-foreground hidden md:block shrink-0" />

                <Select
                  value={filters.role || "all"}
                  onValueChange={(v: any) =>
                    setFilters((prev) => ({ ...prev, role: v }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[140px] text-xs">
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
                  value={filters.status || "active"}
                  onValueChange={(v: any) =>
                    setFilters((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[120px] text-xs">
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

          {/* TABLE */}
          <StaffTable
            data={staffList}
            loading={loading}
            onDeactivate={handleDeactivate}
          />
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4 md:space-y-6">
          <StaffWorkload />

          <Card className="stone-card bg-linear-to-br from-primary/5 to-background border-primary/20">
            <CardContent className="p-4 md:p-5">
              <h3 className="font-bold text-sm md:text-base text-foreground mb-2">
                Optimize Shifts
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                View performance analytics to balance workload distribution
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary/30 text-primary hover:bg-primary/10"
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

function StatusCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="stone-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-black text-foreground mt-0.5">
            {value}
          </p>
        </div>
        <div
          className={`p-2 md:p-2.5 rounded-lg md:rounded-xl ${bg} group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
