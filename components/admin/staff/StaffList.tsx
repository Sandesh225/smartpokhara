"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
/ui/;
import { Input } from "@/components/ui/input";
/ui/;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
/ui/;
import { Badge } from "@/components/ui/badge";
/ui/;
import { Button } from "@/components/ui/button";
/ui/;
import { Search, Filter, Edit, UserCog } from "lucide-react";

interface StaffListProps {
  initialStaff: any[];
  departments: any[];
}

export default function StaffList({ initialStaff, departments }: StaffListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Client-side filtering logic
  const filteredStaff = initialStaff.filter((staff) => {
    const fullName = staff.user?.user_profiles?.full_name?.toLowerCase() || "";
    const email = staff.user?.email?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower);
    const matchesDept = deptFilter === "all" || staff.department_id === deptFilter;
    const matchesRole = roleFilter === "all" || staff.staff_role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "dept_head":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">Supervisor</Badge>;
      case "admin":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Admin</Badge>;
      case "ward_staff":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Ward Staff</Badge>;
      case "field_staff":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">Field Staff</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{role?.replace("_", " ")}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Search & Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search staff by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
               <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="dept_head">Supervisor</SelectItem>
                <SelectItem value="dept_staff">Dept. Staff</SelectItem>
                <SelectItem value="ward_staff">Ward Staff</SelectItem>
                <SelectItem value="field_staff">Field Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No staff members found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{staff.user?.user_profiles?.full_name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{staff.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(staff.staff_role)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {staff.department ? (
                          <div className="font-medium text-gray-700">{staff.department.name}</div>
                        ) : (
                          <span className="text-gray-400 italic">No Dept</span>
                        )}
                        {staff.ward && (
                          <div className="text-xs text-gray-500">Ward {staff.ward.ward_number}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={staff.is_active ? "outline" : "secondary"} 
                        className={staff.is_active ? "text-green-600 border-green-200 bg-green-50" : ""}
                      >
                        {staff.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/staff/${staff.user_id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}