// components/admin/staff/staff-table.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STAFF_ROLE_TYPES = [
  { value: "admin", label: "Admin" },
  { value: "dept_head", label: "Dept Head" },
  { value: "dept_staff", label: "Dept Staff" },
  { value: "ward_staff", label: "Ward Staff" },
  { value: "field_staff", label: "Field Staff" },
  { value: "call_center", label: "Call Center" },
] as const;

type StaffRow = {
  id: string;
  email: string;
  is_active: boolean;
  full_name: string;
  ward_id: string | null;
  roles: { role_type: string; name: string }[];
  primaryRole: string;
};

export default function StaffTable({ staff }: { staff: StaffRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setRoleFilter(searchParams.get("role") ?? "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("q", search.trim());
    else params.delete("q");
    if (roleFilter) params.set("role", roleFilter);
    else params.delete("role");

    router.push(`/admin/staff?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              {STAFF_ROLE_TYPES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={applyFilters}>
          Apply filters
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Primary Role
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                All Roles
              </th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No staff found.
                </td>
              </tr>
            )}

            {staff.map((user) => (
              <tr
                key={user.id}
                className="border-t border-border hover:bg-muted/40"
              >
                <td className="px-4 py-2">
                  <div className="font-medium">
                    {user.full_name || "(No name)"}
                  </div>
                  {user.ward_id && (
                    <div className="text-xs text-muted-foreground">
                      Ward ID: {user.ward_id}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <Badge variant="outline" className="capitalize">
                    {user.primaryRole.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((r) => (
                      <Badge
                        key={r.role_type}
                        variant="secondary"
                        className="capitalize"
                      >
                        {r.name || r.role_type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Badge
                    variant={user.is_active ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/staff/${user.id}`}>Manage</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
