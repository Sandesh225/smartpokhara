'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Skeleton } from '@/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/ui/pagination';
import {
  ArrowUpDown,
  Calendar,
  Eye,
  Filter,
  MapPin,
  MoreVertical,
  Search,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  Printer,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Complaint, ComplaintStatus } from '@/lib/supabase/queries/complaints';

interface ComplaintsTableProps {
  complaints: Complaint[];
  total: number;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  onRowClick?: (complaint: Complaint) => void;
}

const statusConfig: Record<ComplaintStatus, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: React.ReactNode; bgClass: string; textClass: string }> = {
  received: {
    label: 'Received',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
    bgClass: 'bg-blue-100 hover:bg-blue-200',
    textClass: 'text-blue-700',
  },
  under_review: {
    label: 'Under Review',
    variant: 'secondary',
    icon: <AlertCircle className="h-3 w-3" />,
    bgClass: 'bg-purple-100 hover:bg-purple-200',
    textClass: 'text-purple-700',
  },
  assigned: {
    label: 'Assigned',
    variant: 'secondary',
    icon: <FileText className="h-3 w-3" />,
    bgClass: 'bg-indigo-100 hover:bg-indigo-200',
    textClass: 'text-indigo-700',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'secondary',
    icon: <RefreshCw className="h-3 w-3" />,
    bgClass: 'bg-amber-100 hover:bg-amber-200',
    textClass: 'text-amber-700',
  },
  resolved: {
    label: 'Resolved',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    bgClass: 'bg-emerald-100 hover:bg-emerald-200',
    textClass: 'text-emerald-700',
  },
  closed: {
    label: 'Closed',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    bgClass: 'bg-slate-100 hover:bg-slate-200',
    textClass: 'text-slate-700',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
    bgClass: 'bg-red-100 hover:bg-red-200',
    textClass: 'text-red-700',
  },
  reopened: {
    label: 'Reopened',
    variant: 'outline',
    icon: <RefreshCw className="h-3 w-3" />,
    bgClass: 'bg-orange-100 hover:bg-orange-200',
    textClass: 'text-orange-700',
  },
};

const priorityConfig = {
  critical: { label: 'Critical', bgClass: 'bg-red-600', textClass: 'text-white' },
  urgent: { label: 'Urgent', bgClass: 'bg-red-500', textClass: 'text-white' },
  high: { label: 'High', bgClass: 'bg-orange-500', textClass: 'text-white' },
  medium: { label: 'Medium', bgClass: 'bg-amber-500', textClass: 'text-white' },
  low: { label: 'Low', bgClass: 'bg-slate-400', textClass: 'text-white' },
};

export function ComplaintsTable({
  complaints,
  total,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onSortChange,
  sortBy = 'submitted_at',
  sortOrder = 'DESC',
  onRowClick,
}: ComplaintsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortBy, desc: sortOrder === 'DESC' }
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Tracking code copied to clipboard', {
      description: code,
      duration: 2000,
    });
  };

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: 'tracking_code',
      header: ({ column }) => {
        const isActive = sortBy === 'tracking_code';
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder = isActive && sortOrder === 'ASC' ? 'DESC' : 'ASC';
              setSorting([{ id: 'tracking_code', desc: newOrder === 'DESC' }]);
              onSortChange?.('tracking_code', newOrder);
            }}
            className="px-0 font-semibold hover:bg-transparent hover:text-blue-600 transition-colors"
          >
            Tracking ID
            <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
          </Button>
        );
      },
      cell: ({ row }) => {
        const code = row.getValue('tracking_code') as string;
        return (
          <div className="flex items-center gap-2 group">
            <code className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
              {code}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyTracking(code);
              }}
              aria-label="Copy tracking code"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: () => <span className="font-semibold text-slate-900">Title</span>,
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div className="max-w-[250px] truncate font-medium text-slate-900" title={title}>
            {title}
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: () => <span className="font-semibold text-slate-900">Category</span>,
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <div className="flex items-center gap-2">
            {category?.icon && (
              <span className="text-lg">{category.icon}</span>
            )}
            <span className="text-sm font-medium text-slate-700">{category?.name || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'ward',
      header: () => <span className="font-semibold text-slate-900">Ward</span>,
      cell: ({ row }) => {
        const ward = row.original.ward;
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {ward ? `Ward ${ward.ward_number}` : 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: () => <span className="font-semibold text-slate-900">Status</span>,
      cell: ({ row }) => {
        const status = row.getValue('status') as ComplaintStatus;
        const config = statusConfig[status];
        
        if (!config) return null;
        
        return (
          <Badge className={`gap-1.5 ${config.bgClass} ${config.textClass} border-0 font-medium transition-colors`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: () => <span className="font-semibold text-slate-900">Priority</span>,
      cell: ({ row }) => {
        const priority = row.getValue('priority') as keyof typeof priorityConfig;
        const config = priorityConfig[priority];
        
        if (!config) return null;
        
        return (
          <Badge className={`${config.bgClass} ${config.textClass} border-0 font-semibold text-xs px-2.5 py-0.5`}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'submitted_at',
      header: ({ column }) => {
        const isActive = sortBy === 'submitted_at';
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder = isActive && sortOrder === 'ASC' ? 'DESC' : 'ASC';
              setSorting([{ id: 'submitted_at', desc: newOrder === 'DESC' }]);
              onSortChange?.('submitted_at', newOrder);
            }}
            className="px-0 font-semibold hover:bg-transparent hover:text-blue-600 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Date
            <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('submitted_at'));
        return (
          <div className="text-sm font-medium text-slate-600">
            {format(date, 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const complaint = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-slate-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="Open actions menu"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push(`/complaints/${complaint.id}`)}
                className="cursor-pointer gap-2"
              >
                <Eye className="h-4 w-4 text-blue-600" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopyTracking(complaint.tracking_code)}
                className="cursor-pointer gap-2"
              >
                <Copy className="h-4 w-4 text-slate-600" />
                <span>Copy Tracking Code</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => window.open(`/complaints/${complaint.id}/print`, '_blank')}
                className="cursor-pointer gap-2"
              >
                <Printer className="h-4 w-4 text-slate-600" />
                <span>Print Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: complaints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => {
    const statusConf = statusConfig[complaint.status];
    
    return (
      <Card
        className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden"
        onClick={() => onRowClick?.(complaint) || router.push(`/complaints/${complaint.id}`)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        
        <CardHeader className="pb-3 relative">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-slate-900 mb-2 truncate">
                {complaint.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <code className="font-mono text-xs font-semibold bg-slate-100 text-slate-900 px-2 py-0.5 rounded">
                  {complaint.tracking_code}
                </code>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3 w-3" />
                  Ward {complaint.ward?.ward_number || 'N/A'}
                </span>
              </CardDescription>
            </div>
            <Badge className={`gap-1.5 ${statusConf.bgClass} ${statusConf.textClass} border-0 font-medium shrink-0`}>
              {statusConf.icon}
              {statusConf.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 pt-0 relative">
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Tag className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium">{complaint.category?.name || 'N/A'}</span>
            </div>
            {complaint.subcategory && (
              <>
                <span className="text-slate-400">→</span>
                <span className="text-sm text-slate-600 font-medium">{complaint.subcategory.name}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm text-slate-600">
              {format(new Date(complaint.submitted_at), 'MMM dd, yyyy')}
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50/50 relative">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/complaints/${complaint.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="hidden md:block">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50/50 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <TableHead key={i} className="h-12">
                      <Skeleton className="h-5 w-24 bg-slate-200" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row} className="hover:bg-slate-50/50">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                      <TableCell key={cell} className="py-4">
                        <Skeleton className="h-5 w-full bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="md:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-200">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-slate-200" />
                <Skeleton className="h-4 w-1/2 bg-slate-100 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-slate-100" />
                <Skeleton className="h-4 w-2/3 bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center mb-5 shadow-sm">
          <Search className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No complaints found
        </h3>
        <p className="text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          You haven't submitted any complaints yet, or no complaints match your current filters.
        </p>
        <Button 
          onClick={() => router.push('/complaints/new')}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
        >
          <FileText className="h-4 w-4" />
          Submit New Complaint
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow 
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200 hover:from-slate-100 hover:to-blue-100/50 transition-colors"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-12 text-slate-900">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                  onClick={() => onRowClick?.(row.original) || router.push(`/complaints/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="md:hidden">
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 space-y-4">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={`${
                    currentPage === 1 
                      ? 'pointer-events-none opacity-40' 
                      : 'cursor-pointer hover:bg-blue-50 hover:text-blue-700'
                  } transition-colors`}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className={`cursor-pointer transition-all ${
                        pageNum === currentPage
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                          : 'hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={`${
                    currentPage === totalPages 
                      ? 'pointer-events-none opacity-40' 
                      : 'cursor-pointer hover:bg-blue-50 hover:text-blue-700'
                  } transition-colors`}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 bg-slate-50 inline-block px-4 py-2 rounded-full">
              Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(currentPage * pageSize, total)}</span> of{' '}
              <span className="font-semibold text-slate-900">{total}</span> complaints
            </p>
          </div>
        </div>
      )}
    </div>
  );
}