// components/complaints/ComplaintListFilters.tsx
'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ComplaintListFiltersProps {
  availableFilters: {
    status?: boolean;
    priority?: boolean;
    category?: boolean;
    ward?: boolean;
    department?: boolean;
    dateRange?: boolean;
  };
  categories?: Array<{ id: string; name: string }>;
  wards?: Array<{ id: string; ward_number: number; name: string }>;
  departments?: Array<{ id: string; name: string }>;
}

export function ComplaintListFilters({
  availableFilters,
  categories = [],
  wards = [],
  departments = [],
}: ComplaintListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);

        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v) params.append(key, v);
          });
        } else if (typeof value === 'string' && value.trim() !== '') {
          params.set(key, value);
        }
      });

      router.push(`/citizen/complaints?${params.toString()}`);
    },
    [router, searchParams],
  );

  const getArrayParam = (key: string): string[] => {
    const vals = searchParams.getAll(key);
    return vals.length ? vals : [];
  };

  const statusOptions = [
    'draft',
    'submitted',
    'received',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected',
    'escalated',
  ] as const;

  const priorityOptions = ['low', 'medium', 'high', 'critical'] as const;

  const currentSearch = searchParams.get('search') ?? '';
  const currentStatus = getArrayParam('status');
  const currentPriority = getArrayParam('priority');
  const currentCategory = getArrayParam('category');
  const currentWard = getArrayParam('ward');
  const currentDepartment = getArrayParam('department');
  const currentDateFrom = searchParams.get('dateFrom') ?? '';
  const currentDateTo = searchParams.get('dateTo') ?? '';

  return (
    <div className="bg-white p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Tracking code or title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={currentSearch}
            onBlur={(e) => updateQuery({ search: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateQuery({ search: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </div>

        {/* Status Filter */}
        {availableFilters.status && (
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              multiple
              className="w-full h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentStatus}
              onChange={(e) =>
                updateQuery({
                  status: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value,
                  ),
                })
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Priority Filter */}
        {availableFilters.priority && (
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              multiple
              className="w-full h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentPriority}
              onChange={(e) =>
                updateQuery({
                  priority: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value,
                  ),
                })
              }
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        {availableFilters.category && categories.length > 0 && (
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              multiple
              className="w-full h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentCategory}
              onChange={(e) =>
                updateQuery({
                  category: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value,
                  ),
                })
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ward Filter */}
        {availableFilters.ward && wards.length > 0 && (
          <div>
            <label
              htmlFor="ward"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ward
            </label>
            <select
              id="ward"
              multiple
              className="w-full h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentWard}
              onChange={(e) =>
                updateQuery({
                  ward: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value,
                  ),
                })
              }
            >
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {`Ward ${ward.ward_number} - ${ward.name}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Department Filter (mainly for staff/admin, but generic here) */}
        {availableFilters.department && departments.length > 0 && (
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Department
            </label>
            <select
              id="department"
              multiple
              className="w-full h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentDepartment}
              onChange={(e) =>
                updateQuery({
                  department: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value,
                  ),
                })
              }
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        {availableFilters.dateRange && (
          <div className="space-y-2">
            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={currentDateFrom}
                onChange={(e) =>
                  updateQuery({ dateFrom: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={currentDateTo}
                onChange={(e) =>
                  updateQuery({ dateTo: e.target.value || undefined })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
