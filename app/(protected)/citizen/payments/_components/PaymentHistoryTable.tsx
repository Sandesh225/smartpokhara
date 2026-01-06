// components/citizen/payments/PaymentHistoryTable.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Receipt,
  CreditCard,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentHistoryTableProps {
  payments: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange?: (search: string) => void;
  currentSearch?: string;
}

export default function PaymentHistoryTable({
  payments,
  total,
  page,
  limit,
  isLoading,
  onPageChange,
  onSearchChange,
  currentSearch = "",
}: PaymentHistoryTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const totalPages = Math.ceil(total / limit) || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, any> = {
      esewa: "📱",
      khalti: "💰",
      connect_ips: "🌐",
      bank_transfer: "🏦",
      credit_card: "💳",
      debit_card: "💳",
      wallet: "👛",
      cash: "💵"
    };
    return icons[method] || "💳";
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      esewa: "eSewa",
      khalti: "Khalti",
      connect_ips: "Connect IPS",
      bank_transfer: "Bank Transfer",
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      wallet: "Digital Wallet",
      cash: "Cash"
    };
    return labels[method] || method.replace(/_/g, " ");
  };

  const getBillTypeLabel = (billType: string) => {
    const labels: Record<string, string> = {
      property_tax: "Property Tax",
      water_bill: "Water Bill",
      electricity_bill: "Electricity Bill",
      waste_management: "Waste Management",
      parking_fee: "Parking Fee",
      business_license: "Business License",
      building_permit: "Building Permit",
      event_permit: "Event Permit",
      other: "Other"
    };
    return labels[billType] || billType.replace(/_/g, " ");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Completed",
        className: "bg-green-100 text-green-800 hover:bg-green-100"
      },
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      },
      failed: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Failed",
        className: "bg-red-100 text-red-800 hover:bg-red-100"
      },
      refunded: {
        variant: "outline" as const,
        icon: ArrowLeftRight,
        label: "Refunded",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100"
      }
    };

    const config = variants[status] || {
      variant: "outline" as const,
      icon: Clock,
      label: status,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100"
    };

    return (
      <Badge variant={config.variant} className={cn("gap-1 text-xs", config.className)}>
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    // In a real implementation, you would trigger a filter update
  };

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = newSortBy === sortBy && sortOrder === "DESC" ? "ASC" : "DESC";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePreviousPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const handleExportCSV = async () => {
    try {
      // In a real implementation, you would fetch the CSV data
      const response = await fetch('/api/payments/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (isLoading && payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No payment history
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm
                ? "No payments match your search"
                : "You haven't made any payments yet"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedPayments = payments.filter(p => p.status === "completed").length;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount_paid, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History ({total})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {from}-{to} of {total} payments • Total: NPR {totalAmount.toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-[200px] sm:w-[250px]"
              />
            </div>

            {/* Filter */}
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportCSV}
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Bill Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/citizen/payments/receipt/${payment.id}`)}
                >
                  <TableCell>
                    <div className="font-medium">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(payment.created_at), "hh:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {getBillTypeLabel(payment.bill?.bill_type || "other")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.bill?.bill_number || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    NPR {payment.amount_paid.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPaymentMethodIcon(payment.payment_method)}</span>
                      <span className="text-sm">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell>
                    {payment.receipt_number ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono">{payment.receipt_number}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/citizen/payments/receipt/${payment.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {completedPayments > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Successful Payments: {completedPayments}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Total Amount: NPR {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}