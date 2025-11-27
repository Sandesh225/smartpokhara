// components/admin/complaints/ComplaintsTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/DataTable';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface ComplaintsTableProps {
  complaints: any[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  searchParams: any;
  categories: any[];
  departments: any[];
  wards: any[];
}

export function ComplaintsTable({
  complaints,
  totalCount,
  currentPage,
  itemsPerPage,
  searchParams,
  categories,
  departments,
  wards,
}: ComplaintsTableProps) {
  const router = useRouter();
  const [selectedComplaints, setSelectedComplaints] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const columns = [
    {
      key: 'tracking_code',
      label: 'Tracking Code',
      render: (value: any, row: any) => (
        <a
          href={`/admin/complaints/${row.id}`}
          className="font-mono text-blue-600 hover:text-blue-900 font-medium hover:underline"
        >
          {value}
        </a>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (value: any) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.category?.name}
          </div>
          {row.subcategory && (
            <div className="text-sm text-gray-500">
              {row.subcategory.name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value: any) => <PriorityBadge priority={value} />,
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (value: any) => formatDate(value),
    },
    {
      key: 'sla_due_at',
      label: 'SLA Due',
      render: (value: any, row: any) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today && !['resolved','closed','rejected'].includes(row.status);
        
        return (
          <div className={isOverdue ? 'text-red-600 font-medium flex items-center gap-1' : ''}>
            {formatDate(value)}
            {isOverdue && <span className="text-red-500">⚠️</span>}
          </div>
        );
      },
    },
  ];

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/admin/complaints?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/admin/complaints?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/admin/complaints?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/admin/complaints');
  };

  const activeFilterCount = Object.keys(searchParams).filter(k => k !== 'page').length;

  return (
    <div className="space-y-6">
      {/* Search and Filter Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search complaints..."
                onSearch={handleSearch}
                defaultValue={searchParams.search}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={searchParams.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="submitted,received">Pending</option>
                    <option value="assigned,in_progress">In Progress</option>
                    <option value="resolved,closed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={searchParams.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={searchParams.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={searchParams.department || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={complaints}
            selectable={true}
            onSelectionChange={setSelectedComplaints}
            onRowClick={(row) => router.push(`/admin/complaints/${row.id}`)}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / itemsPerPage)}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Bulk Actions */}
      {selectedComplaints.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700">
                {selectedComplaints.length} complaint(s) selected
              </p>
              <div className="flex gap-2">
                <select className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Assign Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <Button size="sm">Apply</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}